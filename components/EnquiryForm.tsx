'use client';

import Link from 'next/link';
import { startTransition, useActionState, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { submitEnquiry, type EnquiryState } from '@/app/actions/enquiry';
import { otherTopic, services } from '@/lib/services';

type Field = 'topic' | 'message' | 'name' | 'email';
type Errors = Partial<Record<Field, string>>;

type Props = {
  /** Pre-selects the topic (service pages) and starts on the second step. */
  defaultTopic?: string;
  /** Saved with the enquiry so the admin panel shows where it came from. */
  source: string;
  /** "compact" is the card in the homepage hero. */
  variant?: 'full' | 'compact';
  /** Element id for in-page links to the form. */
  id?: string;
};

const steps = [
  { label: 'Topic', title: 'What can we help with?', hint: 'Pick the closest fit. You can add the detail next.' },
  { label: 'Details', title: 'Tell us a little more.', hint: 'Your goals, a rough idea, timings or a budget range: whatever you have. No need for a perfect brief.' },
  { label: 'Contact', title: 'Where should we reply?', hint: 'We’ll only use these details to reply to your enquiry.' },
];
const stepOf: Record<Field, number> = { topic: 0, message: 1, name: 2, email: 2 };
const topicOptions = [...services.map(service => ({ value: service.name, number: service.number })), { value: otherTopic, number: '07' }];

const initialState: EnquiryState = { status: 'idle', message: '', errors: {} };

function validate(step: number, values: Record<Field | 'company', string>): Errors {
  const errors: Errors = {};
  if (step === 0 && !values.topic) errors.topic = 'Choose the option that fits best.';
  if (step === 1) {
    const length = values.message.trim().length;
    if (length < 10) errors.message = 'Add a little more detail, at least a sentence.';
    else if (length > 5000) errors.message = 'Please keep your message under 5,000 characters.';
  }
  if (step === 2) {
    if (!values.name.trim()) errors.name = 'Tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = 'Enter a valid email address, like name@company.com.';
  }
  return errors;
}

/**
 * Three-step enquiry form. Before hydration (or without JS) every step is shown at once and the form
 * posts normally to the server action; once hydrated it becomes a guided, validated step-by-step flow.
 */
export default function EnquiryForm({ defaultTopic = '', source, variant = 'full', id }: Props) {
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const firstStep = defaultTopic ? 1 : 0;

  const [state, formAction, pending] = useActionState(submitEnquiry, initialState);
  const [enhanced, setEnhanced] = useState(false);
  const [step, setStep] = useState(firstStep);
  const [furthest, setFurthest] = useState(firstStep);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState({ topic: defaultTopic, message: '', name: '', email: '', company: '' });

  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<(HTMLFieldSetElement | null)[]>([]);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef<HTMLInputElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    setEnhanced(true);
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  // Move focus to the new step's group (its legend is announced) after the user changes step.
  useEffect(() => {
    if (moved.current) stepRefs.current[step]?.focus();
  }, [step]);

  // React to the server's answer.
  useEffect(() => {
    if (state.status === 'success') {
      setSent(true);
    } else if (state.status === 'error') {
      const serverErrors = state.errors as Errors;
      setErrors(serverErrors);
      const fields = Object.keys(serverErrors) as Field[];
      if (fields.length) {
        moved.current = true;
        setStep(Math.min(...fields.map(field => stepOf[field])));
      } else {
        statusRef.current?.focus();
      }
    }
  }, [state]);

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  const update = (field: keyof typeof values) => (value: string) => {
    setValues(current => ({ ...current, [field]: value }));
    if (errors[field as Field]) setErrors(current => ({ ...current, [field]: undefined }));
  };

  const goTo = (target: number) => {
    moved.current = true;
    setStep(target);
  };

  const next = () => {
    const stepErrors = validate(step, values);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) {
      const first = Object.keys(stepErrors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const target = Math.min(step + 1, steps.length - 1);
    setFurthest(current => Math.max(current, target));
    goTo(target);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < steps.length - 1) return next();
    for (const index of [0, 1, 2]) {
      const stepErrors = validate(index, values);
      if (Object.keys(stepErrors).length) {
        setErrors(stepErrors);
        if (index === step) {
          // Same step: put the cursor straight into the first field that needs fixing.
          formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(stepErrors)[0]}"]`)?.focus();
        } else {
          goTo(index);
        }
        return;
      }
    }
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };

  // Enter in a single-line field moves on instead of submitting early.
  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    const target = event.target as HTMLElement;
    if (event.key === 'Enter' && target.tagName === 'INPUT' && step < steps.length - 1) {
      event.preventDefault();
      next();
    }
  };

  const restart = () => {
    setValues({ topic: defaultTopic, message: '', name: '', email: '', company: '' });
    setErrors({});
    setSent(false);
    setStep(firstStep);
    setFurthest(firstStep);
    moved.current = true;
    if (startedRef.current) startedRef.current.value = String(Date.now());
  };

  // Before hydration (no JS) the server's answer is the only source of errors and success.
  const shownErrors: Errors = enhanced ? errors : (state.errors as Errors);
  const describedBy = (field: Field, hint?: string) => [hint, shownErrors[field] ? fid(`${field}-error`) : ''].filter(Boolean).join(' ') || undefined;
  const errorNote = (field: Field) => (shownErrors[field] ? <p className="field-error" id={fid(`${field}-error`)}>{shownErrors[field]}</p> : null);
  const isHidden = (index: number) => enhanced && index !== step;
  const compact = variant === 'compact';

  if (sent || (!enhanced && state.status === 'success')) {
    const firstName = values.name.trim().split(/\s+/)[0];
    return (
      <div className={`step-form is-${variant} step-success`} id={id} ref={successRef} tabIndex={-1} role="status" aria-live="polite">
        <span className="step-success-mark" aria-hidden="true">✓</span>
        <p className="mono">MESSAGE RECEIVED</p>
        <h3>Thanks{firstName ? `, ${firstName}` : ''}.</h3>
        <p>Your message is with our team. We’ll reply to <strong>{values.email || 'you'}</strong> by email.</p>
        <button type="button" className="text-link" onClick={restart}>Send another message <span className="arrow" aria-hidden="true">↺</span></button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      id={id}
      className={`step-form is-${variant}${enhanced ? ' is-enhanced' : ''}`}
      action={formAction}
      onSubmit={onSubmit}
      onKeyDown={onKeyDown}
      noValidate={enhanced}
      aria-busy={pending || undefined}
    >
      {compact && <p className="mono step-form-kicker">TELL US WHAT YOU’RE BUILDING</p>}

      {enhanced && (
        <ol className="step-progress" aria-label="Form progress">
          {steps.map((item, index) => {
            const done = index < step;
            const reachable = index <= furthest && index !== step;
            return (
              <li key={item.label} className={`${index === step ? 'is-current' : ''}${done ? ' is-done' : ''}`} aria-current={index === step ? 'step' : undefined}>
                {reachable ? (
                  <button type="button" onClick={() => goTo(index)}>
                    <span className="step-dot" aria-hidden="true">{done ? '✓' : index + 1}</span>
                    <span>{item.label}<span className="visually-hidden">: go back to step {index + 1}</span></span>
                  </button>
                ) : (
                  <span className="step-progress-item">
                    <span className="step-dot" aria-hidden="true">{done ? '✓' : index + 1}</span>
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {/* Step 1: topic */}
      <fieldset className="step-panel" ref={node => { stepRefs.current[0] = node; }} tabIndex={-1} hidden={isHidden(0)} aria-describedby={describedBy('topic', fid('topic-hint'))}>
        <legend className="step-title">
          {enhanced && <span className="mono">STEP 1 OF 3</span>}
          {steps[0].title}
        </legend>
        <p className="field-hint" id={fid('topic-hint')}>{steps[0].hint}</p>
        <div className={`topic-grid${shownErrors.topic ? ' is-invalid' : ''}`}>
          {topicOptions.map(option => (
            <label className="topic-option" key={option.value}>
              <input type="radio" name="topic" value={option.value} checked={values.topic === option.value} onChange={event => update('topic')(event.target.value)} />
              <span className="topic-card">
                <span className="mono">{option.number}</span>
                <span className="topic-name">{option.value}</span>
              </span>
            </label>
          ))}
        </div>
        {errorNote('topic')}
        {enhanced && (
          <div className="step-actions">
            <span />
            <button type="button" className="button" onClick={next}>Next: details <span className="arrow" aria-hidden="true">→</span></button>
          </div>
        )}
      </fieldset>

      {/* Step 2: message */}
      <fieldset className="step-panel" ref={node => { stepRefs.current[1] = node; }} tabIndex={-1} hidden={isHidden(1)}>
        <legend className="step-title">
          {enhanced && <span className="mono">STEP 2 OF 3</span>}
          {steps[1].title}
        </legend>
        {enhanced && values.topic && (
          <p className="step-chosen">
            <span className="mono">ABOUT</span> {values.topic}
            <button type="button" onClick={() => goTo(0)}>Change<span className="visually-hidden"> topic</span></button>
          </p>
        )}
        <div className="field">
          <label htmlFor={fid('message')}>Your message <span aria-hidden="true">*</span></label>
          <textarea
            id={fid('message')}
            name="message"
            rows={compact ? 5 : 7}
            minLength={10}
            maxLength={5000}
            required
            value={values.message}
            onChange={event => update('message')(event.target.value)}
            aria-invalid={shownErrors.message ? true : undefined}
            aria-describedby={describedBy('message', fid('message-hint'))}
          />
          <p className="field-hint step-hint-row" id={fid('message-hint')}>
            <span>{steps[1].hint}</span>
            {enhanced && <span className="char-count" aria-hidden="true">{values.message.length}/5000</span>}
          </p>
          {errorNote('message')}
        </div>
        {enhanced && (
          <div className="step-actions">
            <button type="button" className="step-back" onClick={() => goTo(0)}><span aria-hidden="true">←</span> Back</button>
            <button type="button" className="button" onClick={next}>Next: your details <span className="arrow" aria-hidden="true">→</span></button>
          </div>
        )}
      </fieldset>

      {/* Step 3: contact details */}
      <fieldset className="step-panel" ref={node => { stepRefs.current[2] = node; }} tabIndex={-1} hidden={isHidden(2)}>
        <legend className="step-title">
          {enhanced && <span className="mono">STEP 3 OF 3</span>}
          {steps[2].title}
        </legend>
        <div className="step-fields">
          <div className="field">
            <label htmlFor={fid('name')}>Your name <span aria-hidden="true">*</span></label>
            <input id={fid('name')} name="name" type="text" autoComplete="name" maxLength={120} required value={values.name} onChange={event => update('name')(event.target.value)} aria-invalid={shownErrors.name ? true : undefined} aria-describedby={describedBy('name')} />
            {errorNote('name')}
          </div>
          <div className="field">
            <label htmlFor={fid('email')}>Email address <span aria-hidden="true">*</span></label>
            <input id={fid('email')} name="email" type="email" autoComplete="email" maxLength={254} required value={values.email} onChange={event => update('email')(event.target.value)} aria-invalid={shownErrors.email ? true : undefined} aria-describedby={describedBy('email')} />
            {errorNote('email')}
          </div>
          <div className="field field-wide">
            <label htmlFor={fid('company')}>Company <span className="optional">(optional)</span></label>
            <input id={fid('company')} name="company" type="text" autoComplete="organization" maxLength={120} value={values.company} onChange={event => update('company')(event.target.value)} />
          </div>
        </div>

        {enhanced && !compact && (
          <dl className="step-review">
            <div><dt>Topic</dt><dd>{values.topic || '—'} <button type="button" onClick={() => goTo(0)}>Edit<span className="visually-hidden"> topic</span></button></dd></div>
            <div><dt>Message</dt><dd><span className="step-review-message">{values.message.trim() || '—'}</span> <button type="button" onClick={() => goTo(1)}>Edit<span className="visually-hidden"> message</span></button></dd></div>
          </dl>
        )}

        <div className="field-trap" aria-hidden="true">
          <label htmlFor={fid('website')}>Leave this field empty</label>
          <input id={fid('website')} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <input ref={startedRef} type="hidden" name="started" defaultValue="" />
        <input type="hidden" name="source" value={source} />

        <div className="step-actions">
          {enhanced ? <button type="button" className="step-back" onClick={() => goTo(1)}><span aria-hidden="true">←</span> Back</button> : <span />}
          <button className="button" type="submit" disabled={pending}>
            {pending ? 'Sending…' : 'Send message'} <span className="arrow" aria-hidden="true">↗</span>
          </button>
        </div>
        <p className="form-privacy">We’ll only use these details to reply to your enquiry. See our <Link href="/privacy#form">privacy policy</Link>.</p>
      </fieldset>

      <p ref={statusRef} className={`form-status${state.status === 'error' ? ' is-error' : ''}`} role="status" aria-live="polite" tabIndex={-1}>
        {pending ? 'Sending your message…' : state.status === 'error' ? state.message : ''}
      </p>
    </form>
  );
}
