type Props = {
  label: string
  value: string | number
  highlight?: boolean
  sub?: string
}

export default function MetricRow({ label, value, highlight = false, sub }: Props) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-slate-700/40 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-sm font-mono ${highlight ? 'text-teal-400 font-semibold' : 'text-slate-200'}`}>
        {value}
        {sub && <span className="text-xs text-slate-500 ml-1">{sub}</span>}
      </span>
    </div>
  )
}
