import { scoreColor, scoreLabel } from '@/lib/map/colorScales'

type Props = {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export default function ScoreBadge({ score, size = 'md' }: Props) {
  const color = scoreColor(score)
  const label = scoreLabel(score)

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5 font-semibold',
  }[size]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono ${sizeClasses}`}
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      <span className="font-bold">{score}</span>
      <span className="opacity-70 font-sans font-normal">{label}</span>
    </span>
  )
}
