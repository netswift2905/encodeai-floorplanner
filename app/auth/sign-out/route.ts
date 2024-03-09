import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  await supabase.auth.signOut()

  return NextResponse.redirect(`${requestUrl.origin}/`, {
    // a 301 status is required to redirect from a POST to a GET route
    status: 301,
  })
}
