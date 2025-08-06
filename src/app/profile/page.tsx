// src/app/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProfilePage() {
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserName(user?.user_metadata?.name || user?.email || 'No name')
    }

    getUser()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">Welcome, {userName}</h1>
    </div>
  )
}
