import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TrackerClient from './client'

export const dynamic = 'force-dynamic'

export default async function TrackerPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (
        id, title, company, location, url, source, score, verdict
      )
    `)
    .eq('user_id', user.id)
    .order('applied_at', { ascending: false })

  return <TrackerClient applications={applications ?? []} userEmail={user.email} />
}
