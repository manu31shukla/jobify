import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ── Manu's profile — edit to match your real experience ──────────
const CANDIDATE_PROFILE = `
Name: Manu Shukla
Role: Full Stack Developer
Experience: ~1.5 years (0-2 YOE)
Current/Past: Sopra Steria, Sangha
Location: Noida, India
Stack: React, TypeScript, Node.js, Next.js, Express, PostgreSQL, Git, REST APIs, Tailwind CSS
Education: Engineering graduate

Key Projects & Achievements:
- Built and deployed production React/TypeScript dashboards at Sopra Steria
- Developed RESTful APIs with Node.js/Express serving 10k+ requests/day
- Implemented responsive UI components reducing page load time by 30%
- Collaborated in Agile sprints, contributed to code reviews and documentation
- Built a full-stack application (Sangha) using Next.js + PostgreSQL
`.trim()

type GenerationType = 'resume' | 'outreach' | 'coverletter'

const PROMPTS: Record<GenerationType, (jd: string) => string> = {
  resume: (jd) => `You are an expert resume writer. Given this job description and candidate profile, generate 5-6 powerful resume bullet points tailored specifically to this JD.

CANDIDATE PROFILE:
${CANDIDATE_PROFILE}

JOB DESCRIPTION:
${jd}

Rules:
- Start each bullet with a strong action verb (Built, Developed, Implemented, Optimized, Led, Reduced, Increased)
- Include specific numbers/metrics where possible
- Match keywords from the JD naturally for ATS
- NO fabrication — only reframe real experience from the profile
- Keep each bullet under 20 words
- Format: plain text, one bullet per line starting with •

Output ONLY the bullet points. No preamble.`,

  outreach: (jd) => `You are a professional career coach. Write a LinkedIn DM to the hiring manager for this role.

CANDIDATE PROFILE:
${CANDIDATE_PROFILE}

JOB DESCRIPTION:
${jd}

Rules:
- Max 4 sentences total
- Mention 1-2 specific things about the role or company
- Highlight 1 relevant strength of the candidate
- End with a soft CTA (happy to share work / open to a quick chat)
- Tone: warm, professional, not desperate
- Do NOT start with "Hi, I came across your posting..."

Output ONLY the message. No preamble.`,

  coverletter: (jd) => `You are an expert cover letter writer. Write a concise, ATS-optimized cover letter.

CANDIDATE PROFILE:
${CANDIDATE_PROFILE}

JOB DESCRIPTION:
${jd}

Rules:
- 3 short paragraphs (opening, value pitch, closing)
- Opening: genuine interest in this specific company/role
- Middle: connect 2-3 concrete achievements to the JD requirements
- Close: confident CTA
- Max 200 words total
- Extract company name from JD, no placeholders

Output ONLY the cover letter. No preamble.`,
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY not set.\nGet your FREE key at: https://aistudio.google.com/app/apikey\nThen add it to Vercel → Settings → Environment Variables' },
      { status: 500 }
    )
  }

  let body: {
    jobId: string
    type: GenerationType
    job: { title: string; company: string; description?: string; location?: string }
  }

  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { type, job } = body
  if (!type || !job) return NextResponse.json({ error: 'Missing type or job' }, { status: 400 })

  const jd = [
    `Title: ${job.title}`,
    `Company: ${job.company}`,
    `Location: ${job.location ?? 'Not specified'}`,
    `Description: ${job.description ?? `A ${job.title} role at ${job.company}.`}`,
  ].join('\n')

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(PROMPTS[type](jd))
    return NextResponse.json({ result: result.response.text() })
  } catch (e: unknown) {
    console.error('Gemini error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
