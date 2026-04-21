import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    job_id, status = 'Applied',
    tailored_resume, outreach_message, cover_letter, notes
  } = body

  if (!job_id) return NextResponse.json({ error: 'job_id required' }, { status: 400 })

  // Calculate follow-up date (+7 days from now)
  const followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  // Upsert (one application per user per job)
  const { data, error } = await supabase
    .from('applications')
    .upsert({
      user_id:         user.id,
      job_id,
      status,
      tailored_resume:  tailored_resume ?? null,
      outreach_message: outreach_message ?? null,
      cover_letter:     cover_letter ?? null,
      notes:            notes ?? null,
      follow_up_date:   followUpDate,
      applied_at:       new Date().toISOString(),
      updated_at:       new Date().toISOString(),
    }, {
      onConflict: 'user_id,job_id',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ application: data })
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('applications')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id) // RLS guard
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ application: data })
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('applications')
    .select(`*, jobs(id, title, company, location, url, source, score, verdict)`)
    .eq('user_id', user.id)
    .order('applied_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ applications: data })
}
