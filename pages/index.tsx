import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'

  console.log('Auth Status:', status)
  console.log('Session:', session)
  console.log('Is Loading:', isLoading)

  if (!session && status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Not Authenticated</p>
          <p>Please sign in to continue</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          Loading...
        </div>
      </div>
    )
  }

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const res = await fetch('/api/users/count')
        const data = await res.json()
        
        if (data.count === 0) {
          router.push('/auth/signup')
        } else if (session) {
          router.push('/dashboard')
        } else {
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('Failed to check users:', err)
      }
    }

    if (status === 'authenticated' || status === 'unauthenticated') {
      checkUsers()
    }
  }, [router, session, status])

  return null
} 
