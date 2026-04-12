type Props = {
  value: number // 0–1
  label?: string
}

export default function ConfidenceChip({ value, label = 'Detection confidence' }: Props) {
  const pct = Math.round(value * 100)
  const color = pct >= 90 ? '#00c87a' : pct >= 75 ? '#f59e0b' : '#ef4444'

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-mono"
      style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}33` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}: {pct}%
    </span>
  )
}
