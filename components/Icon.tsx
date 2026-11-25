// Small outline icon set (24px grid, 1.6 stroke). Decorative by default: pass `label` to expose one.

const paths: Record<string, React.ReactNode> = {
  'arrow-up-right': <path d="M7 17 17 7M8 7h9v9" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  'arrow-down': <path d="M12 5v14M6 13l6 6 6-6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
  chat: <><path d="M5 18.5 3.5 21l.6-4.2A8 8 0 1 1 8 20.2" /><circle cx="8.5" cy="12" r=".6" /><circle cx="12" cy="12" r=".6" /><circle cx="15.5" cy="12" r=".6" /></>,
  web: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 9h18M7 6.5h.01M10 6.5h.01" /><path d="M8 14h4M8 17h7" /></>,
  design: <><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-1.6 1.2-2.4 2.6-2.4H18a3 3 0 0 0 3-3C21 7.6 17 3 12 3Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10.5" cy="7.5" r="1" /><circle cx="15" cy="7.8" r="1" /></>,
  cloud: <><path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 8.5a4.5 4.5 0 0 1-.5 9.5Z" /><path d="M9 14h6" /></>,
  automation: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" /></>,
  security: <><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6Z" /><path d="m9 12 2 2 4-4" /></>,
  strategy: <><path d="M4 20V10M10 20V4M16 20v-7M21 20H3" /></>,
  marketing: <><path d="M3 10.5v3a1.5 1.5 0 0 0 1.5 1.5H7l7 4V5L7 9H4.5A1.5 1.5 0 0 0 3 10.5Z" /><path d="M7 15l1.5 4.5M18 9a4 4 0 0 1 0 6M20.5 6.5a7.5 7.5 0 0 1 0 11" /></>,
  discover: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  shape: <><path d="M4 20 9 4l5 10 3-5 3 11Z" /></>,
  build: <><path d="m14.5 6.5 3 3M4 20l6.5-6.5M13 4l7 7-3 3-7-7Z" /></>,
  evolve: <><path d="M3 17c4 0 5-10 9-10s5 6 9 6" /><path d="M17 7h4v4" /></>,
};

type Props = { name: keyof typeof paths | string; label?: string; className?: string; size?: number };

export default function Icon({ name, label, className, size = 24 }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {paths[name] ?? null}
    </svg>
  );
}
