export function StatusChip({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'success' | 'warn' | 'danger';
  children: string;
}) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
