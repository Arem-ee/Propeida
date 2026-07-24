'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Loader2 } from 'lucide-react'

export default function SetUsernamePage() {
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    supabaseRef.current.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      supabaseRef.current
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data && !/^user_[a-f0-9]{8}$/.test(data.username)) {
            router.push('/onboarding')
          } else {
            setLoading(false)
          }
        })
    })
  }, [router])

  const checkUsername = async (value: string) => {
    if (value.length < 2) { setUsernameStatus('idle'); setSuggestion(null); return }
    setUsernameStatus('checking')
    const { data } = await supabaseRef.current.from('profiles').select('username').ilike('username', value).maybeSingle()
    if (data) {
      setUsernameStatus('taken')
      let counter = 1
      let alt = `${value}${counter}`
      while (true) {
        const { data: exists } = await supabaseRef.current.from('profiles').select('username').ilike('username', alt).maybeSingle()
        if (!exists) break
        counter++
        alt = `${value}${counter}`
      }
      setSuggestion(alt)
    } else {
      setUsernameStatus('available')
      setSuggestion(null)
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '')
    setUsername(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) { setUsernameStatus('idle'); setSuggestion(null); return }
    debounceRef.current = setTimeout(() => checkUsername(value), 400)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameStatus === 'taken') { setError(`Username "${username}" is already taken. Try "${suggestion}" instead.`); return }
    if (username.length < 2) { setError('Username must be at least 2 characters.'); return }
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabaseRef.current.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: updateError } = await supabaseRef.current
      .from('profiles')
      .update({ username })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900 mb-8 min-h-[44px]">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-base">P</span>
        Propeida
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 shadow-xs">
        <h1 className="text-xl font-extrabold text-gray-900">Choose your username</h1>
        <p className="mt-1 text-sm text-gray-500">One last step before you can start practicing.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}

          <div>
            <label htmlFor="username" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                required
                minLength={2}
                value={username}
                onChange={handleUsernameChange}
                placeholder="YourPublicName"
                autoFocus
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm focus:border-blue-600 focus:outline-none min-h-[44px]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />}
                {usernameStatus === 'available' && <Check className="h-4 w-4 text-green-500" />}
                {usernameStatus === 'taken' && <X className="h-4 w-4 text-red-500" />}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
              This will be shown publicly on the leaderboard — use your real name or a nickname, whichever you&apos;re comfortable with.
            </p>
            {usernameStatus === 'taken' && suggestion && (
              <p className="mt-1 text-xs text-red-600">
                Taken. Try <button type="button" onClick={() => { setUsername(suggestion); checkUsername(suggestion) }} className="font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer">{suggestion}</button> instead.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || usernameStatus === 'checking' || usernameStatus === 'taken'}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 min-h-[44px] cursor-pointer"
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}