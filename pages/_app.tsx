import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'

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
  return (
    <SessionProvider
      session={pageProps.session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <Component {...pageProps} />
    </SessionProvider>
  )
} 