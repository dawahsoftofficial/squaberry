'use client';

import Link from 'next/link';
import { startTransition, useActionState, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import Icon from './Icon';
import { getFormToken } from '@/app/actions/form-token';
import { submitProductSignup, type ProductSignupState } from '@/app/actions/product';
import { signupInterests } from '@/lib/products';

const initialState: ProductSignupState = { status: 'idle', message: '', errors: {} };
type Values = { name: string; email: string; company: string; phone: string; interest: string; message: string };

/** Product page signup card. Saved as a product enquiry; the visitor gets an email confirmation. */
export default function ProductSignupForm({ product, productName, organisation = 'business' }: { product: string; productName: string; organisation?: string }) {
  const Organisation = organisation.charAt(0).toUpperCase() + organisation.slice(1);
  const [state, formAction, pending] = useActionState(submitProductSignup, initialState);
  const [values, setValues] = useState<Values>({ name: '', email: '', company: '', phone: '', interest: signupInterests[0], message: '' });
  const [token, setToken] = useState('');
  const statusRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  useEffect(() => {
    // Server-signed token for the spam check (lib/spam.ts).
    // Kept in state: React would reset a hidden input's value set directly on every re-render.
    getFormToken().then(setToken).catch(() => {});
  }, []);
  useEffect(() => {
    if (state.status === 'success') successRef.current?.focus();
    else if (state.status === 'error') statusRef.current?.focus();
  }, [state]);

  const set = (key: keyof Values) => (event: { target: { value: string } }) => setValues(current => ({ ...current, [key]: event.target.value }));
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };
  const error = (name: keyof ProductSignupState['errors']) =>
    state.errors[name] ? <p className="field-error" id={fid(`${name}-error`)}>{state.errors[name]}</p> : null;
  const described = (name: keyof ProductSignupState['errors']) => (state.errors[name] ? fid(`${name}-error`) : undefined);

  if (state.status === 'success') {
    return (
      <div className="step-form product-form step-success" ref={successRef} tabIndex={-1} role="status" aria-live="polite">
        <span className="step-success-mark" aria-hidden="true"><Icon name="check" size={28} /></span>
        <h3>You’re on the list{values.name ? `, ${values.name.split(' ')[0]}` : ''}.</h3>
        <p>Thanks for your interest in our {productName}. We’ve emailed a confirmation to <strong>{values.email}</strong> and one of the team will be in touch soon.</p>
        <Link className="text-link" href="/products">Explore our other products</Link>
      </div>
    );
  }

  return (
    <form className="step-form product-form" action={formAction} onSubmit={onSubmit} aria-labelledby={fid('title')}>
      <p className="step-form-kicker eyebrow">Get started</p>
      <h2 id={fid('title')} className="product-form-title">Get {productName} for your {organisation}</h2>

      <input type="hidden" name="product" value={product} />

      <fieldset className="product-interest">
        <legend>What would you like?</legend>
        <div className={`topic-grid${state.errors.interest ? ' is-invalid' : ''}`}>
          {signupInterests.map(option => (
            <label className="topic-option" key={option}>
              <input type="radio" name="interest" value={option} checked={values.interest === option} onChange={set('interest')} />
              <span className="topic-card">{option}</span>
            </label>
          ))}
        </div>
        {error('interest')}
      </fieldset>

      <div className="product-fields">
        <div className="field">
          <label htmlFor={fid('name')}>Your name *</label>
          <input id={fid('name')} name="name" autoComplete="name" required maxLength={120} value={values.name} onChange={set('name')} aria-invalid={state.errors.name ? true : undefined} aria-describedby={described('name')} />
          {error('name')}
        </div>
        <div className="field">
          <label htmlFor={fid('email')}>Work email *</label>
          <input id={fid('email')} name="email" type="email" autoComplete="email" required maxLength={254} value={values.email} onChange={set('email')} aria-invalid={state.errors.email ? true : undefined} aria-describedby={described('email')} />
          {error('email')}
        </div>
        <div className="field">
          <label htmlFor={fid('company')}>{Organisation} name *</label>
          <input id={fid('company')} name="company" autoComplete="organization" required maxLength={120} value={values.company} onChange={set('company')} aria-invalid={state.errors.company ? true : undefined} aria-describedby={described('company')} />
          {error('company')}
        </div>
        <div className="field">
          <label htmlFor={fid('phone')}>Phone <span className="optional">(optional)</span></label>
          <input id={fid('phone')} name="phone" type="tel" autoComplete="tel" maxLength={40} value={values.phone} onChange={set('phone')} aria-invalid={state.errors.phone ? true : undefined} aria-describedby={described('phone')} />
          {error('phone')}
        </div>
        <div className="field field-wide">
          <label htmlFor={fid('message')}>Tell us about your {organisation} <span className="optional">(optional)</span></label>
          <textarea id={fid('message')} name="message" rows={3} maxLength={3000} value={values.message} onChange={set('message')} aria-invalid={state.errors.message ? true : undefined} aria-describedby={described('message')} />
          {error('message')}
        </div>
      </div>

      <div className="field-trap" aria-hidden="true">
        <label htmlFor={fid('website')}>Leave this field empty</label>
        <input id={fid('website')} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="token" value={token} readOnly />

      <p ref={statusRef} className={`form-status${state.status === 'error' ? ' is-error' : ''}`} role="status" aria-live="polite" tabIndex={-1}>
        {state.status === 'error' ? state.message : ''}
      </p>

      <div className="product-form-foot">
        <button className="btn is-accent" type="submit" disabled={pending}>
          <span>{pending ? 'Sending…' : 'Get started'}</span>
          <span className="btn-icon"><Icon name="arrow-up-right" size={18} /></span>
        </button>
        <p className="product-form-note">We’ll only use these details to reply. See our <Link href="/privacy#form">privacy policy</Link>.</p>
      </div>
    </form>
  );
}
