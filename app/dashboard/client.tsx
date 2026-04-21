'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ApplicationModal from '@/components/ApplicationModal'
import { VerdictBadge, ScoreBar, SourceBadge } from '@/components/ScoreBadge'

interface Job {
  id: string; title: string; company: string; location?: string
  description?: string; url: string; source: string
  score: number; verdict: string; tags: string[]; fetched_at: string
}

interface Props {
  jobs: Job[]
  stats: { total: number; applyAsap: number; strong: number }
  userEmail?: string
}

const VERDICT_ORDER = ['APPLY ASAP', 'STRONG MATCH', 'POSSIBLE', 'SKIP']
const SOURCES = ['All', 'LinkedIn', 'Remotive', 'Adzuna', 'Arbeitnow']

export default function DashboardClient({ jobs, stats, userEmail }: Props) {
  const router = useRouter()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [filterVerdict, setFilterVerdict] = useState<string>('All')
  const [filterSource, setFilterSource] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchMsg, setFetchMsg] = useState('')

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      if (filterVerdict !== 'All' && j.verdict !== filterVerdict) return false
      if (filterSource !== 'All' && j.source !== filterSource) return false
      if (search) {
        const q = search.toLowerCase()
        if (!j.title.toLowerCase().includes(q) &&
            !j.company.toLowerCase().includes(q) &&
            !(j.location ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [jobs, filterVerdict, filterSource, search])

  async function triggerFetch() {
    setFetching(true)
    setFetchMsg('fetching jobs...')
    try {
      const res = await fetch('/api/jobs/fetch', {
        method: 'GET',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ''}` },
      })
      const data = await res.json()
      setFetchMsg(`✓ ${data.inserted ?? 0} new jobs added`)
      setTimeout(() => { setFetchMsg(''); router.refresh() }, 2000)
    } catch {
      setFetchMsg('fetch failed — check console')
    }
    setFetching(false)
  }

  return (
    <>
      <Navbar email={userEmail} />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'total jobs', value: stats.total, color: 'text-[#e6edf3]' },
            { label: 'apply asap', value: stats.applyAsap, color: 'text-green' },
            { label: 'strong match', value: stats.strong, color: 'text-blue' },
          ].map(s => (
            <div key={s.label} className="card text-center py-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-muted uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <input
            type="text"
            placeholder="search title, company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-1.5 text-xs font-mono
                       w-48 focus:outline-none focus:border-green/50"
          />

          <select
            value={filterVerdict}
            onChange={e => setFilterVerdict(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-1.5 text-xs font-mono
                       focus:outline-none focus:border-green/50 cursor-pointer"
          >
            <option value="All">all verdicts</option>
            {VERDICT_ORDER.map(v => (
              <option key={v} value={v}>{v.toLowerCase()}</option>
            ))}
          </select>

          <select
            value={filterSource}
            onChange={e => setFilterSource(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-1.5 text-xs font-mono
                       focus:outline-none focus:border-green/50 cursor-pointer"
          >
            {SOURCES.map(s => (
              <option key={s} value={s}>{s.toLowerCase()}</option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-3">
            {fetchMsg && (
              <span className="text-xs text-green font-mono">{fetchMsg}</span>
            )}
            <button
              onClick={triggerFetch}
              disabled={fetching}
              className="btn-primary text-[11px]"
            >
              {fetching ? 'fetching...' : '↻ fetch now'}
            </button>
          </div>
        </div>

        <div className="text-xs text-muted mb-3">
          showing {filtered.length} of {jobs.length} jobs · auto-fetches every 6 hours
        </div>

        {/* Job table */}
        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-3xl mb-3">🔍</div>
            <div className="text-sm text-muted mb-4">
              {jobs.length === 0
                ? 'No jobs yet — click "↻ fetch now" to start'
                : 'No jobs match your filters'}
            </div>
            {jobs.length === 0 && (
              <button onClick={triggerFetch} className="btn-primary">
                fetch jobs now
              </button>
            )}
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface2 text-[10px] uppercase tracking-widest text-muted">
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Company</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3">Score</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Verdict</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Source</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job, i) => (
                  <tr
                    key={job.id}
                    className={`border-b border-border hover:bg-surface2/50 transition-colors cursor-pointer
                                ${i % 2 === 0 ? '' : 'bg-surface/30'}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#e6edf3] line-clamp-1">{job.title}</div>
                      <div className="text-muted text-[10px] md:hidden">{job.company}</div>
                    </td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">{job.company}</td>
                    <td className="px-4 py-3 text-muted hidden lg:table-cell">
                      {job.location?.split(',')[0] ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar score={job.score} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <VerdictBadge verdict={job.verdict} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <SourceBadge source={job.source} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedJob(job) }}
                        className="text-[10px] text-green hover:underline whitespace-nowrap"
                      >
                        generate →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ApplicationModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </>
  )
}
