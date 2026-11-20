// Shared date formatting for the admin panel (UK style, London time).
const formatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/London',
});

export function formatDate(value: Date | string): string {
  return formatter.format(new Date(value));
}
