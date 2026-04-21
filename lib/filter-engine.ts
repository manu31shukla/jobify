// ══════════════════════════════════════════
// Filter Engine — Manu Shukla
// React · TypeScript · Node.js · 0-2 YOE
// ══════════════════════════════════════════

export interface RawJob {
  title: string
  company: string
  location?: string
  description?: string
  url: string
  source: string
}

export interface ScoredJob extends RawJob {
  score: number
  verdict: string
  tags: string[]
}

const STACK = {
  react: 20,
  typescript: 18,
  'node.js': 15,
  nodejs: 15,
  'next.js': 14,
  nextjs: 14,
  javascript: 12,
  html: 8,
  css: 8,
  tailwind: 8,
  redux: 10,
  graphql: 10,
  postgresql: 8,
  postgres: 8,
  mongodb: 8,
  docker: 6,
  aws: 6,
  git: 5,
  jest: 6,
  express: 8,
  nestjs: 8,
  'rest api': 7,
  restful: 7,
}

const EXPERIENCE_GOOD = [
  'fresher', '0-2', '0 to 2', '0-1', '0 to 1', '1-2', '1 to 2',
  'entry level', 'entry-level', 'junior', 'associate', 'graduate',
  'recent grad', 'new grad', '< 2 years', 'less than 2',
]

const EXPERIENCE_BAD = [
  'senior', 'sr.', '5+', '6+', '7+', '8+', '10+',
  'lead', 'principal', 'staff', 'architect', 'head of', 'vp ',
  '5 years', '6 years', '7 years', '8 years', 'experienced professional',
]

const LOCATION_GOOD = [
  'india', 'remote', 'noida', 'delhi', 'gurugram', 'gurgaon',
  'bangalore', 'bengaluru', 'mumbai', 'hyderabad', 'pune', 'chennai',
  'anywhere', 'work from home', 'wfh', 'hybrid', 'pan india',
]

const ROLE_GOOD = [
  'full stack', 'fullstack', 'full-stack', 'frontend', 'front-end',
  'front end', 'software engineer', 'software developer', 'sde',
  'web developer', 'web engineer', 'application developer',
]

const COMPANY_SKIP = [
  'staffing', 'consulting', 'recruiter', 'placement', 'manpower',
  'talent acquisition', 'hr solutions',
]

export function scoreJob(job: RawJob): ScoredJob {
  const text = `${job.title} ${job.company} ${job.location ?? ''} ${job.description ?? ''}`.toLowerCase()
  const title = job.title.toLowerCase()
  let score = 0
  const tags: string[] = []

  // ── Stack match (max ~50) ──────────────────
  for (const [tech, pts] of Object.entries(STACK)) {
    if (text.includes(tech)) {
      score += pts
      if (pts >= 10) tags.push(tech)
    }
  }
  score = Math.min(score, 50)

  // ── Experience level (max 25) ──────────────
  const isBadExp = EXPERIENCE_BAD.some(w => text.includes(w))
  const isGoodExp = EXPERIENCE_GOOD.some(w => text.includes(w))

  if (isBadExp && !isGoodExp) {
    score -= 30
    tags.push('overqualified')
  } else if (isGoodExp) {
    score += 25
    tags.push('entry-level')
  } else {
    score += 10 // neutral - no YOE mentioned
  }

  // ── Location (max 15) ─────────────────────
  const loc = (job.location ?? '').toLowerCase()
  if (LOCATION_GOOD.some(l => loc.includes(l) || text.includes(l))) {
    score += 15
    tags.push('good-location')
  }

  // ── Role type (max 15) ────────────────────
  if (ROLE_GOOD.some(r => title.includes(r))) {
    score += 15
    tags.push('role-match')
  }

  // ── Company filter ────────────────────────
  const co = job.company.toLowerCase()
  if (COMPANY_SKIP.some(s => co.includes(s))) {
    score -= 40
    tags.push('recruiter')
  }

  // ── Clamp 0-100 ──────────────────────────
  score = Math.max(0, Math.min(100, score))

  // ── Verdict ──────────────────────────────
  let verdict: string
  if (score >= 78) verdict = 'APPLY ASAP'
  else if (score >= 58) verdict = 'STRONG MATCH'
  else if (score >= 38) verdict = 'POSSIBLE'
  else verdict = 'SKIP'

  return { ...job, score, verdict, tags }
}
