// ══════════════════════════════════════════
// Job Fetchers — Multiple Sources
// ══════════════════════════════════════════

import { RawJob } from '../filter-engine'

// ─── LinkedIn RSS ──────────────────────────────────────────────
// Uses LinkedIn's public RSS endpoints (no auth required)
export async function fetchLinkedInJobs(): Promise<RawJob[]> {
  const queries = [
    'full+stack+developer',
    'react+developer',
    'frontend+developer',
    'software+engineer',
  ]
  const location = 'India'
  const jobs: RawJob[] = []

  for (const query of queries) {
    try {
      const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${query}&location=${location}&f_E=1%2C2&f_JT=F&start=0`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (personal job search aggregator)',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (!res.ok) continue

      const html = await res.text()
      const jobMatches = html.matchAll(
        /<div class="base-card[^"]*"[^>]*data-entity-urn="[^"]*"[^>]*>([\s\S]*?)<\/div>/g
      )

      for (const match of jobMatches) {
        const block = match[0]
        const titleMatch = block.match(/class="base-search-card__title"[^>]*>([^<]+)</)
        const companyMatch = block.match(/class="base-search-card__subtitle"[^>]*>[\s\S]*?<a[^>]*>([^<]+)</)
        const locationMatch = block.match(/class="job-search-card__location"[^>]*>([^<]+)</)
        const linkMatch = block.match(/href="(https:\/\/www\.linkedin\.com\/jobs\/view\/[^?"]+)/)

        if (titleMatch && companyMatch && linkMatch) {
          jobs.push({
            title: titleMatch[1].trim(),
            company: companyMatch[1].trim(),
            location: locationMatch?.[1].trim(),
            url: linkMatch[1],
            source: 'LinkedIn',
          })
        }
      }

      await sleep(1500) // respect rate limits
    } catch (e) {
      console.error(`LinkedIn fetch error for ${query}:`, e)
    }
  }

  return dedup(jobs)
}

// ─── Remotive API ──────────────────────────────────────────────
// Free, no API key, remote jobs worldwide
export async function fetchRemotiveJobs(): Promise<RawJob[]> {
  const categories = ['software-dev', 'frontend']
  const jobs: RawJob[] = []

  for (const cat of categories) {
    try {
      const res = await fetch(
        `https://remotive.com/api/remote-jobs?category=${cat}&limit=40`,
        { signal: AbortSignal.timeout(10000) }
      )
      if (!res.ok) continue
      const data = await res.json()

      for (const j of data.jobs ?? []) {
        jobs.push({
          title: j.title,
          company: j.company_name,
          location: j.candidate_required_location || 'Remote',
          description: stripHtml(j.description ?? '').slice(0, 600),
          url: j.url,
          source: 'Remotive',
        })
      }
    } catch (e) {
      console.error('Remotive fetch error:', e)
    }
  }

  return dedup(jobs)
}

// ─── Adzuna API ────────────────────────────────────────────────
// Free tier at developer.adzuna.com — India-specific jobs
export async function fetchAdzunaJobs(): Promise<RawJob[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) return []

  const searches = [
    'react developer',
    'full stack developer',
    'node js developer',
  ]
  const jobs: RawJob[] = []

  for (const q of searches) {
    try {
      const encoded = encodeURIComponent(q)
      const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=20&what=${encoded}&content-type=application/json`
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) continue
      const data = await res.json()

      for (const j of data.results ?? []) {
        jobs.push({
          title: j.title,
          company: j.company?.display_name ?? 'Unknown',
          location: j.location?.display_name,
          description: j.description?.slice(0, 600),
          url: j.redirect_url,
          source: 'Adzuna',
        })
      }

      await sleep(500)
    } catch (e) {
      console.error('Adzuna fetch error:', e)
    }
  }

  return dedup(jobs)
}

// ─── Arbeitnow (free, no key) ─────────────────────────────────
export async function fetchArbeitnowJobs(): Promise<RawJob[]> {
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api?page=1', {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const data = await res.json()
    const jobs: RawJob[] = []

    for (const j of data.data ?? []) {
      const tags: string[] = j.tags ?? []
      const isRelevant = ['React', 'Node', 'TypeScript', 'JavaScript', 'Full Stack', 'Frontend']
        .some(t => j.title?.includes(t) || tags.includes(t))
      if (!isRelevant) continue

      jobs.push({
        title: j.title,
        company: j.company_name,
        location: j.location || 'Remote',
        description: stripHtml(j.description ?? '').slice(0, 600),
        url: j.url,
        source: 'Arbeitnow',
      })
    }

    return dedup(jobs)
  } catch (e) {
    console.error('Arbeitnow fetch error:', e)
    return []
  }
}

// ─── Helpers ──────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function dedup(jobs: RawJob[]): RawJob[] {
  const seen = new Set<string>()
  return jobs.filter(j => {
    const key = j.url.split('?')[0]
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function fetchAllJobs(): Promise<RawJob[]> {
  const [linkedin, remotive, adzuna, arbeitnow] = await Promise.allSettled([
    fetchLinkedInJobs(),
    fetchRemotiveJobs(),
    fetchAdzunaJobs(),
    fetchArbeitnowJobs(),
  ])

  const all: RawJob[] = [
    ...(linkedin.status === 'fulfilled' ? linkedin.value : []),
    ...(remotive.status === 'fulfilled' ? remotive.value : []),
    ...(adzuna.status === 'fulfilled' ? adzuna.value : []),
    ...(arbeitnow.status === 'fulfilled' ? arbeitnow.value : []),
  ]

  // Final dedup across all sources
  const seen = new Set<string>()
  return all.filter(j => {
    const key = j.url.split('?')[0].toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
