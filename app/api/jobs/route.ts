import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const verdict = searchParams.get('verdict')
  const source = searchParams.get('source')
  const limit = parseInt(searchParams.get('limit') ?? '100')

  let query = supabase
    .from('jobs')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit)

  if (verdict && verdict !== 'All') query = query.eq('verdict', verdict)
  if (source && source !== 'All')   query = query.eq('source', source)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ jobs: data })
}
