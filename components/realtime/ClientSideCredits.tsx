'use client'

import { type Database } from '@/types/supabase'
import { type creditsRow } from '@/types/utils'
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export const revalidate = 0

interface ClientSideCreditsProps {
  creditsRow: creditsRow | null
}

export default function ClientSideCredits({
  creditsRow,
}: ClientSideCreditsProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [credits, setCredits] = useState<creditsRow | null>(creditsRow)

  useEffect(() => {
    const channel = supabase
      .channel('realtime credits')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'credits' },
        (payload: { new: creditsRow }) => {
          setCredits(payload.new)
        }
      )
      .subscribe()

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      supabase.removeChannel(channel)
    }
  }, [supabase, credits, setCredits])

  if (!creditsRow) return <p>Credits: 0</p>

  if (!credits) return null

  return <p>Credits: {credits.credits}</p>
}
