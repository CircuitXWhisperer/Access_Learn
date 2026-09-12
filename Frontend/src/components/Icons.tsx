export function Icon({ children, size = 20 }: { children: string; size?: number }) {
  return <span aria-hidden="true" style={{ fontSize: size, lineHeight: 1, display: 'inline-flex' }}>{children}</span>;
}
