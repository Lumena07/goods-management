import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

function AuthDebug({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log('=== NextAuth Debug ===')
    console.log('Window Location:', typeof window !== 'undefined' ? window.location.href : 'SSR')
    console.log('Base URL:', typeof window !== 'undefined' ? window.location.origin : 'SSR')
    console.log('=====================')
  }, [])

  return <>{children}</>
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <div className="mb-4 text-xl">Loading application...</div>
        <div className="text-sm text-gray-500">Please wait while we initialize your session</div>
      </div>
    </div>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  // Log initial props for debugging
  console.log('App Props:', {
    hasSession: !!pageProps.session,
    keys: Object.keys(pageProps)
  })

  return (
    <SessionProvider
      session={pageProps.session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <AuthDebug>
        <Component {...pageProps} />
      </AuthDebug>
    </SessionProvider>
  )
} 