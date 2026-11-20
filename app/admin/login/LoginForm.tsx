'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '../actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: '' });
  return (
    <form action={action} className="admin-form">
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? 'loginError' : undefined}
        />
        {state.error && <p className="field-error" id="loginError" role="alert">{state.error}</p>}
      </div>
      <button className="button" type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'} <span className="arrow" aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
