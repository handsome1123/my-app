// src/app/login/page.tsx
'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/profile`,
      },
    })

    if (error) {
      alert('Login error: ' + error.message)
    }
  }

  return (
    <div className="p-8">
      <button
        onClick={handleGoogleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Continue with Google
      </button>
    </div>
  )
}
