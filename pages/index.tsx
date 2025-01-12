import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const Home = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

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
      } finally {
        setIsLoading(false)
      }
    }

    if (status !== 'loading') {
      checkUsers()
    }
  }, [router, session, status])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          Loading...
        </div>
      </div>
    )
  }

  return null
}

export default Home 