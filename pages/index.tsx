import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  console.log('=== Auth Debug Info ===')
  console.log('Current Status:', status)
  console.log('Session Data:', session)
  console.log('Router Path:', router.pathname)
  console.log('Router Query:', router.query)
  console.log('=====================')

  useEffect(() => {
    console.log('Effect triggered with status:', status)
    
    const checkUsers = async () => {
      console.log('Checking users...')
      try {
        const res = await fetch('/api/users/count')
        console.log('API Response Status:', res.status)
        const data = await res.json()
        console.log('Users Count Data:', data)
        
        if (data.count === 0) {
          console.log('No users found, redirecting to signup')
          router.push('/auth/signup')
        } else if (session) {
          console.log('Session found, redirecting to dashboard')
          router.push('/dashboard')
        } else if (status === 'unauthenticated') {
          console.log('No session, redirecting to login')
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('API Error:', err)
      }
    }

    if (status !== 'loading') {
      checkUsers()
    } else {
      console.log('Waiting for auth status to resolve...')
    }
  }, [router, session, status])

  // Show loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">Initializing...</div>
        <div className="text-sm text-gray-500">
          Status: {status}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Session: {session ? 'Present' : 'Not Present'}
        </div>
      </div>
    </div>
  )
}