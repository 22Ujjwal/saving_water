type Props = {
  label: string
  variant?: 'default' | 'urgent' | 'esg'
}

export default function DriverTag({ label, variant = 'default' }: Props) {
  const colors = {
    default: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
    urgent: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
    esg: 'bg-teal-900/40 text-teal-300 border-teal-700/40',
  }[variant]

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded border ${colors}`}>
      {label}
    </span>
  )
}
