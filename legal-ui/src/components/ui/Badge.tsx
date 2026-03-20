interface BadgeProps { label: string; color: string; }
export function Badge({ label, color }: BadgeProps) {
  return (
    <span style={{
      background: color + '22', color, padding: '0.2rem 0.6rem',
      borderRadius: '12px', fontSize: '0.76rem', fontWeight: 700, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}
