'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/dashboard')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setMessage('Account created! Check your email to confirm, then log in.')
      setMode('login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-1 tracking-tight">
            job<span className="text-green">bot</span>
          </div>
          <div className="text-xs text-muted">automated job engine · manu shukla</div>
        </div>

        {/* Card */}
        <div className="card">
          <div className="text-xs text-muted mb-5 uppercase tracking-widest">
            {mode === 'login' ? '// sign in' : '// create account'}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted mb-1 block">email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm font-mono 
                           focus:outline-none focus:border-green/50 transition-colors"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="text-xs text-muted mb-1 block">password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm font-mono
                           focus:outline-none focus:border-green/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-xs text-red bg-red/10 border border-red/20 rounded-md p-3">
                {error}
              </div>
            )}

            {message && (
              <div className="text-xs text-green bg-green/10 border border-green/20 rounded-md p-3">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-sm"
            >
              {loading ? 'loading...' : mode === 'login' ? 'sign in →' : 'create account →'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
              className="text-xs text-muted hover:text-blue transition-colors"
            >
              {mode === 'login' ? "don't have an account? sign up" : 'already have an account? sign in'}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-muted/50">
          all data stored privately in your account
        </div>
      </div>
    </div>
  )
}
