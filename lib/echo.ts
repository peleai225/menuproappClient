'use client'

import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

let echo: Echo<'reverb'> | null = null

export function getEcho(): Echo<'reverb'> | null {
  if (typeof window === 'undefined') return null
  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY
  const host = process.env.NEXT_PUBLIC_REVERB_HOST
  // Without a configured Reverb server we simply don't open a socket.
  if (!key || !host) return null

  if (!echo) {
    ;(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher
    try {
      echo = new Echo({
        broadcaster: 'reverb',
        key,
        wsHost: host,
        wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 443,
        wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 443,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
      })
    } catch {
      echo = null
    }
  }
  return echo
}
