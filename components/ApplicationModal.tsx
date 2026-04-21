'use client'

import { useState } from 'react'

interface Job {
  id: string
  title: string
  company: string
  location?: string
  description?: string
  url: string
  source: string
  score: number
  verdict: string
}

interface Props {
  job: Job | null
  onClose: () => void
}

type Tab = 'resume' | 'outreach' | 'coverletter'

export default function ApplicationModal({ job, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('resume')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<Record<Tab, string>>({
    resume: '', outreach: '', coverletter: ''
  })
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!job) return null

  async function generate(type: Tab) {
    setActiveTab(type)
    if (output[type]) return // already generated
    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job!.id, type, job }),
      })
      const data = await res.json()
      if (data.result) {
        setOutput(prev => ({ ...prev, [type]: data.result }))
      }
    } catch (e) {
      setOutput(prev => ({ ...prev, [type]: '⚠ Generation failed. Check your Anthropic API key.' }))
    }

    setLoading(false)
  }

  async function saveApplication() {
    try {
      await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job!.id,
          status: 'Applied',
          tailored_resume: output.resume,
          outreach_message: output.outreach,
          cover_letter: output.coverletter,
        }),
      })
      setSaved(true)
    } catch {}
  }

  function copyOutput() {
    navigator.clipboard.writeText(output[activeTab]).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const TABS: { id: Tab; label: string; desc: string }[] = [
    { id: 'resume',      label: '📄 Resume Bullets',   desc: 'Tailored bullet points for this JD' },
    { id: 'outreach',    label: '💬 LinkedIn Message', desc: 'DM to hiring manager' },
    { id: 'coverletter', label: '✉ Cover Letter',     desc: 'ATS-optimized cover letter' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-xl overflow-hidden shadow-2xl
                      max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-border flex items-start justify-between gap-4">
          <div>
            <div className="font-bold text-sm">{job.title}</div>
            <div className="text-xs text-muted mt-0.5">{job.company} · {job.location}</div>
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className="text-[10px] text-green bg-green/10 border border-green/25 px-2 py-0.5 rounded">
                score: {job.score}
              </span>
              <span className="text-[10px] text-blue bg-blue/10 border border-blue/25 px-2 py-0.5 rounded">
                {job.source}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-[#e6edf3] text-lg leading-none flex-shrink-0">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b border-border bg-surface2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => generate(t.id)}
              className={`text-[11px] px-3 py-1.5 rounded font-mono transition-all flex-1
                ${activeTab === t.id
                  ? 'bg-green/10 text-green border border-green/25'
                  : 'text-muted hover:text-[#e6edf3] border border-transparent'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Output */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && activeTab && !output[activeTab] ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3">
              <div className="w-5 h-5 border-2 border-green/30 border-t-green rounded-full animate-spin" />
              <div className="text-xs text-muted">claude is generating...</div>
            </div>
          ) : output[activeTab] ? (
            <pre className="text-xs text-[#e6edf3] whitespace-pre-wrap leading-relaxed font-mono">
              {output[activeTab]}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
              <div className="text-2xl">🤖</div>
              <div className="text-xs text-muted">
                Click a tab above to generate with Claude API
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-3">
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-[11px] py-1.5 no-underline"
          >
            open job →
          </a>
          <div className="flex gap-2">
            {output[activeTab] && (
              <button onClick={copyOutput} className="btn-ghost text-[11px] py-1.5">
                {copied ? 'copied ✓' : 'copy'}
              </button>
            )}
            <button
              onClick={saveApplication}
              disabled={saved}
              className="btn-primary text-[11px] py-1.5"
            >
              {saved ? 'saved ✓' : 'save to tracker'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
