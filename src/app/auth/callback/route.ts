import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  try {
    if (code) {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        let safeNext = '/'
        try {
          const url = new URL(next, 'http://localhost')
          safeNext = url.pathname + url.search
        } catch {
          /* ignore invalid next param */
        }
        return NextResponse.redirect(`${origin}${safeNext}`)
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console -- logs structurés côté serveur (route auth)
    console.error(JSON.stringify({
      level: 'error',
      message: error instanceof Error ? error.message : 'auth_callback_failed',
      endpoint: '/auth/callback',
      timestamp: new Date().toISOString(),
    }))
  }

  return NextResponse.redirect(`${origin}/?error=auth_callback`)
}
