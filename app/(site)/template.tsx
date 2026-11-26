/** Re-mounted on every navigation, so each page eases in (see .page-enter in globals.css). */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
