'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { logout } from '../actions';
import AdminIcon from './AdminIcon';

const sections = [
  { href: '/admin', label: 'Enquiries', icon: 'inbox' },
  { href: '/admin/portfolio', label: 'Portfolio', icon: 'portfolio' },
] as const;

function useAdminSection() {
  const pathname = usePathname();
  return pathname.startsWith('/admin/portfolio') ? sections[1] : sections[0];
}

export function AdminSidebar() {
  const section = useAdminSection();
  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand" aria-label="Squaberry admin home">
        <img src="/assets/squaberry-logo-tonal.svg" alt="" />
      </Link>
      <nav className="admin-nav" aria-label="Admin navigation">
        {sections.map(item => (
          <Link key={item.href} href={item.href} aria-current={section === item ? 'page' : undefined}>
            <AdminIcon name={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>
      <a className="admin-view-site" href="/" target="_blank" rel="noopener noreferrer" aria-label="View site (opens in a new tab)">
        <span>View site</span>
        <AdminIcon name="external" />
      </a>
    </aside>
  );
}

type Panel = 'notifications' | 'account';

export function AdminHeader({ newEnquiries }: { newEnquiries: number | null }) {
  const section = useAdminSection();
  const [open, setOpen] = useState<Panel | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLButtonElement>(null);
  const notificationsId = useId();
  const accountId = useId();

  useEffect(() => {
    if (!open) return;

    function dismissOutside(event: Event) {
      if (event.target instanceof Node && !actionsRef.current?.contains(event.target)) setOpen(null);
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      (open === 'notifications' ? bellRef : accountRef).current?.focus();
      setOpen(null);
    }

    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('focusin', dismissOutside);
    document.addEventListener('keydown', dismissOnEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('focusin', dismissOutside);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  }, [open]);

  function toggle(panel: Panel) {
    setOpen(current => current === panel ? null : panel);
  }

  const unread = newEnquiries ?? 0;
  return (
    <header className="admin-bar">
      <div className="admin-bar-inner">
        <div className="admin-context">
          <Link href="/admin" className="admin-mobile-brand" aria-label="Squaberry admin home">
            <img src="/assets/squaberry-mark-tonal.svg" alt="" />
          </Link>
          <span className="admin-context-root">Admin <AdminIcon name="right" /></span>
          <strong>{section.label}</strong>
        </div>
        <div className="admin-bar-actions" ref={actionsRef}>
          <button
            type="button"
            className="admin-notifications"
            ref={bellRef}
            aria-label={unread ? `Notifications, ${unread} new ${unread === 1 ? 'enquiry' : 'enquiries'}` : 'Notifications'}
            aria-controls={notificationsId}
            aria-expanded={open === 'notifications'}
            onClick={() => toggle('notifications')}
          >
            <AdminIcon name="bell" />
            {unread > 0 && <span className="admin-notification-count" aria-hidden="true">{unread > 99 ? '99+' : unread}</span>}
          </button>
          <div className="admin-popover" id={notificationsId} hidden={open !== 'notifications'}>
            <h2>Notifications</h2>
            <p>
              {newEnquiries === null ? 'Enquiry count unavailable.'
                : unread === 0 ? 'You’re all caught up.'
                : unread === 1 ? 'You have 1 new enquiry.' : `You have ${unread} new enquiries.`}
            </p>
            <Link
              className="admin-popover-action"
              href="/admin?status=new"
              onClick={() => {
                bellRef.current?.focus();
                setOpen(null);
              }}
            >
              View new enquiries <AdminIcon name="right" />
            </Link>
          </div>
          <button
            type="button"
            className="admin-account"
            ref={accountRef}
            aria-label="Admin account"
            aria-controls={accountId}
            aria-expanded={open === 'account'}
            onClick={() => toggle('account')}
          >
            <span className="admin-avatar"><AdminIcon name="user" /></span>
            <span className="admin-account-name">Admin <AdminIcon name="down" /></span>
          </button>
          <div className="admin-popover admin-account-popover" id={accountId} hidden={open !== 'account'}>
            <form action={logout}>
              <button className="admin-popover-action" type="submit"><AdminIcon name="logout" /> Log out</button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
