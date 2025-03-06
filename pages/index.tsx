import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: false,
    onUnauthenticated() {
      console.log('Session is unauthenticated')
    },
  })
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initAttempts, setInitAttempts] = useState(0)

  console.log('=== Auth Debug Info ===')
  console.log('Current Status:', status)
  console.log('Session Data:', session)
  console.log('Router Path:', router.pathname)
  console.log('Router Query:', router.query)
  console.log('Is Checking Users:', isChecking)
  console.log('Error State:', error)
  console.log('Init Attempts:', initAttempts)
  console.log('=====================')

  // Debug session endpoint
  useEffect(() => {
    const checkSessionEndpoint = async () => {
      try {
        const res = await fetch('/api/auth/session')
        console.log('Session Endpoint Status:', res.status)
        const data = await res.json()
        console.log('Session Endpoint Data:', data)
      } catch (err) {
        console.error('Session Endpoint Error:', err)
      }
    }

    if (status === 'loading' && initAttempts < 3) {
      console.log('Checking session endpoint...')
      checkSessionEndpoint()
      setInitAttempts(prev => prev + 1)
    }
  }, [status, initAttempts])

  useEffect(() => {
    let isMounted = true
    console.log('Effect triggered with status:', status)
    
    const checkUsers = async () => {
      if (isChecking || !isMounted) return
      setIsChecking(true)
      setError(null)
      console.log('Checking users...')
      
      try {
        const res = await fetch('/api/users/count')
        console.log('API Response Status:', res.status)
        
        if (!res.ok) {
          throw new Error(`API returned status: ${res.status}`)
        }
        
        const data = await res.json()
        console.log('Users Count Data:', data)
        
        if (!isMounted) return

        if (data.count === 0) {
          console.log('No users found, redirecting to signup')
          await router.push('/auth/signup')
        } else if (session) {
          console.log('Session found, redirecting to dashboard')
          await router.push('/dashboard')
        } else if (status === 'unauthenticated') {
          console.log('No session, redirecting to login')
          await router.push('/auth/login')
        }
      } catch (err) {
        console.error('API Error:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to check user status')
        }
      } finally {
        if (isMounted) {
          setIsChecking(false)
        }
      }
    }

    // Only proceed if we have a definitive session status
    if (status !== 'loading') {
      checkUsers()
    } else if (initAttempts >= 3) {
      console.log('Session initialization timeout, proceeding as unauthenticated')
      router.push('/auth/login')
    } else {
      console.log('Waiting for auth status to resolve...')
    }

    return () => {
      isMounted = false
    }
  }, [router, session, status, isChecking, initAttempts])

  if (status === 'loading' && initAttempts < 3) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-lg shadow-lg bg-white">
          <div className="mb-4 text-xl font-semibold">
            Initializing Session...
          </div>
          <div className="text-sm text-gray-600 mb-2">
            Attempt: {initAttempts + 1} of 3
          </div>
          <div className="text-xs text-gray-400">
            Please wait while we set up your session
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 rounded-lg shadow-lg bg-white">
        <div className="mb-4 text-xl font-semibold">
          {status === 'loading' ? 'Checking authentication...' : 'Initializing application...'}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          Status: <span className="font-medium">{status}</span>
        </div>
        <div className="text-sm text-gray-600">
          Session: <span className="font-medium">{session ? 'Active' : 'Not Active'}</span>
        </div>
        {isChecking && (
          <div className="mt-4 text-sm text-blue-600">
            Checking user status...
          </div>
        )}
        {error && (
          <div className="mt-4 text-sm text-red-600">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  )
}