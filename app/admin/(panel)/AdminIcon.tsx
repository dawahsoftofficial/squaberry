const icons = {
  inbox: <><path d="M4 4h12l2 8v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4l2-8Z" /><path d="M2 12h5l1 2h4l1-2h5" /></>,
  portfolio: <><rect x="2.5" y="6.5" width="15" height="10" rx="2" /><path d="M7 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.5M2.5 11h15M10 10v2" /></>,
  external: <><path d="M11 3h6v6m0-6-8 8" /><path d="M8 4H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3" /></>,
  bell: <><path d="M15 7a5 5 0 0 0-10 0c0 5-2 5-2 7h14c0-2-2-2-2-7ZM8 17a2 2 0 0 0 4 0" /></>,
  user: <><circle cx="10" cy="6.5" r="2.75" /><path d="M4 16v-1a3.5 3.5 0 0 1 3.5-3.5h5A3.5 3.5 0 0 1 16 15v1" /></>,
  down: <path d="m5 8 5 5 5-5" />,
  right: <path d="m8 5 5 5-5 5" />,
  logout: <><path d="M8 3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3m6-10 3 3-3 3m-6-3h9" /></>,
};

export default function AdminIcon({ name }: { name: keyof typeof icons }) {
  return (
    <svg className="admin-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}
