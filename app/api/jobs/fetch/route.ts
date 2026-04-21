import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchAllJobs } from '@/lib/fetchers'
import { scoreJob } from '@/lib/filter-engine'

export const maxDuration = 60 // Vercel max for free tier

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this automatically for cron jobs,
  // or you can call it manually with the Bearer token)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const isManual = cronSecret && authHeader === `Bearer ${cronSecret}`

  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    // Fetch from all sources
    const rawJobs = await fetchAllJobs()
    console.log(`Fetched ${rawJobs.length} raw jobs`)

    // Score every job
    const scoredJobs = rawJobs.map(scoreJob)

    // Filter out SKIPs with very low scores
    const goodJobs = scoredJobs.filter(j => j.score >= 20)

    // Upsert to DB (url is unique, so duplicates are ignored)
    let inserted = 0
    const BATCH = 50
    for (let i = 0; i < goodJobs.length; i += BATCH) {
      const batch = goodJobs.slice(i, i + BATCH).map(j => ({
        title:       j.title,
        company:     j.company,
        location:    j.location ?? null,
        description: j.description ?? null,
        url:         j.url,
        source:      j.source,
        score:       j.score,
        verdict:     j.verdict,
        tags:        j.tags,
        fetched_at:  new Date().toISOString(),
      }))

      const { error, count } = await supabase
        .from('jobs')
        .upsert(batch, { onConflict: 'url', ignoreDuplicates: true })
        .select('id', { count: 'exact', head: true })

      if (error) console.error('Upsert error:', error.message)
      else inserted += count ?? 0
    }

    // Clean up old jobs (older than 30 days) to keep DB lean
    await supabase
      .from('jobs')
      .delete()
      .lt('fetched_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    return NextResponse.json({
      success: true,
      fetched: rawJobs.length,
      scored: goodJobs.length,
      inserted,
      timestamp: new Date().toISOString(),
    })
  } catch (e: unknown) {
    console.error('Fetch job error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
