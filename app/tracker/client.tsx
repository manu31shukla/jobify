'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { VerdictBadge, ScoreBar, SourceBadge } from '@/components/ScoreBadge'

const STATUSES = ['Applied', 'OA Received', 'Interview', 'Offer', 'Rejected', 'Ghosted']

const STATUS_COLORS: Record<string, string> = {
  'Applied':     'bg-blue/12 text-blue border-blue/25',
  'OA Received': 'bg-orange/12 text-orange border-orange/25',
  'Interview':   'bg-green/12 text-green border-green/25',
  'Offer':       'bg-purple/12 text-purple border-purple/25',
  'Rejected':    'bg-red/12 text-red border-red/25',
  'Ghosted':     'bg-surface3 text-muted border-border',
}

interface Application {
  id: string
  status: string
  applied_at: string
  follow_up_date?: string
  notes?: string
  tailored_resume?: string
  outreach_message?: string
  cover_letter?: string
  jobs: {
    id: string; title: string; company: string
    location?: string; url: string; source: string
    score: number; verdict: string
  }
}

interface Props {
  applications: Application[]
  userEmail?: string
}

export default function TrackerClient({ applications, userEmail }: Props) {
  const [apps, setApps] = useState(applications)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  // Summary counts
  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length
    return acc
  }, {} as Record<string, number>)

  async function updateStatus(appId: string, status: string) {
    setUpdating(appId)
    try {
      await fetch('/api/tracker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status }),
      })
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
    } catch {}
    setUpdating(null)
  }

  async function updateNotes(appId: string, notes: string) {
    await fetch('/api/tracker', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: appId, notes }),
    })
    setApps(prev => prev.map(a => a.id === appId ? { ...a, notes } : a))
  }

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short'
  }) : '—'

  return (
    <>
      <Navbar email={userEmail} />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <div className="text-[10px] text-green uppercase tracking-widest mb-1">// module 07</div>
          <div className="text-xl font-bold">Application Tracker</div>
          <div className="text-xs text-muted mt-1">
            {apps.length} applications · update status as you progress
          </div>
        </div>

        {/* Status pipeline */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {STATUSES.map(s => (
            <div key={s} className="card text-center py-3">
              <div className={`text-lg font-bold ${
                s === 'Offer'    ? 'text-purple' :
                s === 'Interview'? 'text-green' :
                s === 'Applied'  ? 'text-blue' : 'text-muted'
              }`}>{counts[s] ?? 0}</div>
              <div className="text-[9px] text-muted uppercase tracking-wider mt-0.5">{s}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {apps.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-3xl mb-3">📋</div>
            <div className="text-sm text-muted">
              No applications yet. Go to Dashboard, generate output, and save to tracker.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {apps.map(app => (
              <div key={app.id} className="card p-0 overflow-hidden">
                {/* Main row */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-surface2/40"
                  onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{app.jobs.title}</div>
                    <div className="text-xs text-muted">{app.jobs.company} · {app.jobs.location?.split(',')[0]}</div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3">
                    <ScoreBar score={app.jobs.score} />
                    <SourceBadge source={app.jobs.source} />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={app.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateStatus(app.id, e.target.value)}
                      disabled={updating === app.id}
                      className={`text-[10px] px-2 py-1 rounded border font-mono bg-transparent cursor-pointer
                                  ${STATUS_COLORS[app.status]} focus:outline-none`}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s} className="bg-surface text-[#e6edf3]">{s}</option>
                      ))}
                    </select>

                    <span className="text-[10px] text-muted hidden md:block whitespace-nowrap">
                      {fmt(app.applied_at)}
                    </span>

                    <span className="text-muted text-xs">{expanded === app.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded panel */}
                {expanded === app.id && (
                  <div className="border-t border-border p-4 bg-surface2/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Notes */}
                      <div>
                        <div className="text-[10px] text-muted uppercase tracking-widest mb-2">Notes</div>
                        <textarea
                          defaultValue={app.notes ?? ''}
                          onBlur={e => updateNotes(app.id, e.target.value)}
                          rows={3}
                          placeholder="Add notes..."
                          className="w-full bg-surface border border-border rounded px-3 py-2 text-xs font-mono
                                     resize-none focus:outline-none focus:border-green/50"
                        />
                      </div>

                      {/* Links & info */}
                      <div className="space-y-3">
                        <div>
                          <div className="text-[10px] text-muted uppercase tracking-widest mb-1">Follow-up Date</div>
                          <div className="text-xs text-orange">
                            {app.follow_up_date ? fmt(app.follow_up_date) : 'Not set'}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <a
                            href={app.jobs.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost text-[10px] py-1 no-underline"
                          >
                            view job →
                          </a>
                        </div>

                        {/* Show saved AI output */}
                        {(app.tailored_resume || app.outreach_message || app.cover_letter) && (
                          <div>
                            <div className="text-[10px] text-muted uppercase tracking-widest mb-2">Saved AI Output</div>
                            <div className="flex gap-1 flex-wrap">
                              {app.tailored_resume && (
                                <button
                                  onClick={() => navigator.clipboard.writeText(app.tailored_resume!)}
                                  className="text-[10px] bg-surface3 border border-border px-2 py-1 rounded hover:border-green/40 transition-colors"
                                >copy resume bullets</button>
                              )}
                              {app.outreach_message && (
                                <button
                                  onClick={() => navigator.clipboard.writeText(app.outreach_message!)}
                                  className="text-[10px] bg-surface3 border border-border px-2 py-1 rounded hover:border-blue/40 transition-colors"
                                >copy outreach</button>
                              )}
                              {app.cover_letter && (
                                <button
                                  onClick={() => navigator.clipboard.writeText(app.cover_letter!)}
                                  className="text-[10px] bg-surface3 border border-border px-2 py-1 rounded hover:border-purple/40 transition-colors"
                                >copy cover letter</button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
