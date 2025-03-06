import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const res = await fetch('/api/users/count')
        const data = await res.json()
        
        if (data.count === 0) {
          router.push('/auth/signup')
        } else if (session) {
          router.push('/dashboard')
        } else if (status === 'unauthenticated') {
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('Failed to check users:', err)
      }
    }

    if (status !== 'loading') {
      checkUsers()
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
      </div>
    </div>
  )
}