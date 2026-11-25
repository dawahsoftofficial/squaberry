import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import '../admin-base.css';
import '../admin.css';
import LoginForm from './LoginForm';
import { isAdmin } from '@/lib/auth';

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect('/admin');
  return (
    <main id="main" className="admin-login">
      <div className="admin-login-card">
        <img className="admin-login-logo" src="/assets/squaberry-logo.svg" alt="Squaberry" />
        <p className="mono">ADMIN</p>
        <h1>Sign in.</h1>
        <p className="admin-muted">Enquiries and portfolio management.</p>
        <LoginForm />
      </div>
    </main>
  );
}
