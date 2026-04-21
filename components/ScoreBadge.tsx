export function VerdictBadge({ verdict }: { verdict: string }) {
  const cls =
    verdict === 'APPLY ASAP'    ? 'badge-verdict-apply' :
    verdict === 'STRONG MATCH'  ? 'badge-verdict-strong' :
    verdict === 'POSSIBLE'      ? 'badge-verdict-possible' :
                                  'badge-verdict-skip'
  return <span className={cls}>{verdict}</span>
}

export function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 78 ? '#3fb950' :
    score >= 58 ? '#58a6ff' :
    score >= 38 ? '#d29922' : '#f85149'

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-surface3 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-mono" style={{ color }}>{score}</span>
    </div>
  )
}

export function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    LinkedIn:  'bg-blue/12 text-blue border-blue/25',
    Remotive:  'bg-purple/12 text-purple border-purple/25',
    Adzuna:    'bg-orange/12 text-orange border-orange/25',
    Arbeitnow: 'bg-green/12 text-green border-green/25',
  }
  const cls = colors[source] ?? 'bg-surface3 text-muted border-border'
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${cls}`}>
      {source}
    </span>
  )
}
