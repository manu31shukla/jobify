import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch jobs sorted by score
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .order('score', { ascending: false })
    .limit(200)

  // Stats
  const total = jobs?.length ?? 0
  const applyAsap = jobs?.filter(j => j.verdict === 'APPLY ASAP').length ?? 0
  const strong = jobs?.filter(j => j.verdict === 'STRONG MATCH').length ?? 0

  return (
    <DashboardClient
      jobs={jobs ?? []}
      stats={{ total, applyAsap, strong }}
      userEmail={user.email}
    />
  )
}
