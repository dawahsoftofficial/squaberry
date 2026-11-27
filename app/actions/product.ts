'use server';

import { after } from 'next/server';
import { createEnquiry } from '@/lib/data';
import { sendConfirmationEmail, sendEnquiryEmail } from '@/lib/mail';
import { getProduct, signupInterests } from '@/lib/products';
import { rateLimited, visitorKey } from '@/lib/rate-limit';
import { acceptanceLimit, screenSubmission, spendFormToken } from '@/lib/spam';

export type ProductSignupState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  errors: Partial<Record<'name' | 'email' | 'company' | 'phone' | 'interest' | 'message', string>>;
};

function line(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

const success: ProductSignupState = { status: 'success', message: 'Thanks, you’re signed up. We’ll be in touch by email.', errors: {} };

/** Product page signup: saved as a product enquiry (enquiries.product), then emailed to the team and the visitor. */
export async function submitProductSignup(_previous: ProductSignupState, formData: FormData): Promise<ProductSignupState> {
  // Bots that fill the hidden honeypot field get a quiet "success" and nothing is stored.
  if (line(formData.get('website'), 200)) return success;
  const token = line(formData.get('token'), 200);

  const product = getProduct(line(formData.get('product'), 60));
  if (!product) return { status: 'error', message: 'Please choose a product and try again.', errors: {} };

  const name = line(formData.get('name'), 120);
  const email = line(formData.get('email'), 254);
  const company = line(formData.get('company'), 120);
  const phone = line(formData.get('phone'), 40);
  const interest = line(formData.get('interest'), 60);
  const message = String(formData.get('message') ?? '').replace(/\r\n/g, '\n').trim();

  const errors: ProductSignupState['errors'] = {};
  if (!name) errors.name = 'Please tell us your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (!company) errors.company = `Please tell us your ${product.organisation ?? 'business'} name.`;
  if (phone && !/^\+?[\d\s()-]{7,20}$/.test(phone)) errors.phone = 'Please enter a valid phone number, or leave it empty.';
  if (!(signupInterests as readonly string[]).includes(interest)) errors.interest = 'Please choose what you’d like.';
  if (message.length > 3000) errors.message = 'Please keep your message under 3,000 characters.';
  if (Object.keys(errors).length) return { status: 'error', message: 'Please check the highlighted fields and try again.', errors };

  if (rateLimited(await visitorKey())) {
    return { status: 'error', message: 'You’ve sent several requests in a short time. Please try again later or email hello@squaberry.co.uk.', errors: {} };
  }

  // Spam checks (lib/spam.ts): spam and repeats get the same quiet "success", so bots learn nothing.
  const verdict = screenSubmission(token, { name, email, company, message: message || `${interest} ${product.slug}` });
  if (verdict !== 'ok') {
    console.info(`Product signup not saved: ${verdict}.`);
    return success;
  }
  const limit = acceptanceLimit(email, message || product.slug);
  if (limit) {
    return {
      status: 'error',
      message: limit === 'email'
        ? 'We’ve already received several messages from this address today. We’ll reply soon, or email hello@squaberry.co.uk.'
        : 'We’re receiving a lot of messages right now. Please try again in a little while or email hello@squaberry.co.uk.',
      errors: {},
    };
  }
  spendFormToken(token);

  const enquiry = {
    name,
    email,
    company,
    topic: interest,
    message,
    source_page: `Product: ${product.name}`,
    product: product.slug,
    phone: phone || null,
  };
  try {
    const id = await createEnquiry(enquiry);
    after(async () => {
      await sendEnquiryEmail({ id, ...enquiry });
      await sendConfirmationEmail({ id, ...enquiry });
    });
  } catch (error) {
    console.error('Product signup could not be saved:', error instanceof Error ? error.message : error);
    return { status: 'error', message: 'Sorry, that didn’t go through. Please try again or email hello@squaberry.co.uk.', errors: {} };
  }
  return success;
}
