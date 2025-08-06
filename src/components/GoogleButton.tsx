'use client'
import { supabase } from '@/lib/supabaseClient'

export default function GoogleButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-500 text-white p-2 rounded"
    >
      Continue with Google
    </button>
  )
}
