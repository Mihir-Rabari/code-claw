export function StatusChip({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'success' | 'warn' | 'danger';
  children?: any;
}) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
