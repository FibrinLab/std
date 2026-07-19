// Small botanical divider for the vintage design: hairlines take the current
// text colour so the same component works on light and dark grounds.

export function SprigDivider({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg viewBox="0 0 240 28" className={className} style={style} fill="none" aria-hidden="true" focusable="false">
    <path d="M4 15 L92 15 M148 15 L236 15" stroke="currentColor" strokeWidth="1" opacity=".55"/>
    <path d="M104 15 C 112 14 130 14 136 15" stroke="#7E8F60" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M112 15 C 114 9 120 6 126 7 C 122 12 117 14 112 15 Z" fill="#8A9A6B" stroke="#7C8C5D" strokeWidth=".6"/>
    <path d="M120 15 C 122 20 128 23 134 22 C 130 17 125 15 120 15 Z" fill="#8A9A6B" stroke="#7C8C5D" strokeWidth=".6"/>
    <circle cx="138" cy="13" r="2" fill="#C9B078"/>
  </svg>;
}
