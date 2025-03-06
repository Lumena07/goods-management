import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isChecking, setIsChecking] = useState(false)

  console.log('=== Auth Debug Info ===')
  console.log('Current Status:', status)
  console.log('Session Data:', session)
  console.log('Router Path:', router.pathname)
  console.log('Router Query:', router.query)
  console.log('Is Checking Users:', isChecking)
  console.log('=====================')

  useEffect(() => {
    console.log('Effect triggered with status:', status)
    
    const checkUsers = async () => {
      if (isChecking) return
      setIsChecking(true)
      console.log('Checking users...')
      
      try {
        const res = await fetch('/api/users/count')
        console.log('API Response Status:', res.status)
        const data = await res.json()
        console.log('Users Count Data:', data)
        
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
      } finally {
        setIsChecking(false)
      }
    }

    if (status !== 'loading') {
      checkUsers()
    } else {
      console.log('Waiting for auth status to resolve...')
    }
  }, [router, session, status, isChecking])

  // Show loading state with more detail
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
      </div>
    </div>
  )
}