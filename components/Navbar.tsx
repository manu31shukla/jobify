'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: '⚡' },
  { label: 'Tracker', href: '/tracker', icon: '📋' },
]

export default function Navbar({ email }: { email?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-bg/95 backdrop-blur border-b border-border
                    flex items-center px-6 h-12 gap-0">
      {/* Logo */}
      <div className="font-bold text-sm mr-6 tracking-tight whitespace-nowrap">
        job<span className="text-green">bot</span>
      </div>

      {/* Nav links */}
      <div className="flex gap-1 flex-1">
        {NAV.map(n => (
          <button
            key={n.href}
            onClick={() => router.push(n.href)}
            className={`text-[11px] px-3 py-1.5 rounded-md transition-all font-mono
              ${pathname === n.href
                ? 'text-green bg-green/10'
                : 'text-muted hover:text-[#e6edf3] hover:bg-surface2'}`}
          >
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {email && (
          <span className="text-[10px] text-muted hidden sm:block truncate max-w-[160px]">
            {email}
          </span>
        )}
        <button onClick={signOut} className="btn-ghost text-[11px] py-1">
          sign out
        </button>
      </div>
    </nav>
  )
}
