'use client';

import Link from 'next/link';
import { startTransition, useActionState, useEffect, useRef, type FormEvent } from 'react';
import { submitEnquiry, type EnquiryState } from '@/app/actions/enquiry';
import { topics } from '@/lib/services';

type Props = {
  /** Pre-selects the topic, e.g. on a service page. */
  defaultTopic?: string;
  /** Saved with the enquiry so the admin panel shows where it came from. */
  source: string;
};

const initialState: EnquiryState = { status: 'idle', message: '', errors: {} };

/**
 * The enquiry form. Without JS it posts as a normal form (server action) and re-renders with the
 * result. With JS, submit is intercepted so React doesn't clear the fields when validation fails.
 */
export default function EnquiryForm({ defaultTopic = '', source }: Props) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const stamp = () => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  };

  useEffect(stamp, []);

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      stamp();
      statusRef.current?.focus();
    } else if (state.status === 'error') {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      (firstInvalid ?? statusRef.current)?.focus();
    }
  }, [state]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };

  const fieldError = (name: keyof EnquiryState['errors']) => state.errors[name];
  const describedBy = (name: keyof EnquiryState['errors'], hint?: string) =>
    [hint, fieldError(name) ? `${name}Error` : ''].filter(Boolean).join(' ') || undefined;
  const errorNote = (name: keyof EnquiryState['errors']) =>
    fieldError(name) ? <p className="field-error" id={`${name}Error`}>{fieldError(name)}</p> : null;

  return (
    <form ref={formRef} className="contact-form" id="contactForm" action={formAction} onSubmit={onSubmit} aria-busy={pending || undefined}>
      <div className="field">
        <label htmlFor="name">Your name <span aria-hidden="true">*</span></label>
        <input id="name" name="name" type="text" autoComplete="name" maxLength={120} required aria-invalid={fieldError('name') ? true : undefined} aria-describedby={describedBy('name')} />
        {errorNote('name')}
      </div>
      <div className="field">
        <label htmlFor="email">Email address <span aria-hidden="true">*</span></label>
        <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required aria-invalid={fieldError('email') ? true : undefined} aria-describedby={describedBy('email')} />
        {errorNote('email')}
      </div>
      <div className="field">
        <label htmlFor="company">Company <span className="optional">(optional)</span></label>
        <input id="company" name="company" type="text" autoComplete="organization" maxLength={120} />
      </div>
      <div className="field">
        <label htmlFor="topic">What’s it about? <span className="optional">(optional)</span></label>
        <select id="topic" name="topic" defaultValue={defaultTopic} aria-invalid={fieldError('topic') ? true : undefined} aria-describedby={describedBy('topic')}>
          <option value="">Choose a topic</option>
          {topics.map(topic => <option key={topic}>{topic}</option>)}
        </select>
        {errorNote('topic')}
      </div>
      <div className="field field-wide">
        <label htmlFor="message">Your message <span aria-hidden="true">*</span></label>
        <textarea id="message" name="message" rows={7} minLength={10} maxLength={5000} required aria-invalid={fieldError('message') ? true : undefined} aria-describedby={describedBy('message', 'messageHint')} />
        <p className="field-hint" id="messageHint">Your goals, questions or rough idea. No need for a perfect brief.</p>
        {errorNote('message')}
      </div>
      <div className="field-trap" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedRef} type="hidden" name="started" defaultValue="" />
      <input type="hidden" name="source" value={source} />
      <div className="form-footer field-wide">
        <button className="button" type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send message'} <span className="arrow" aria-hidden="true">↗</span>
        </button>
        <p className="form-privacy">We’ll only use these details to reply to your enquiry. See our <Link href="/privacy#form">privacy policy</Link>.</p>
      </div>
      <p
        ref={statusRef}
        className={`form-status field-wide${state.status === 'idle' ? '' : ` is-${state.status}`}`}
        id="formStatus"
        role="status"
        aria-live="polite"
        tabIndex={-1}
      >
        {pending ? 'Sending your message…' : state.message}
      </p>
    </form>
  );
}
