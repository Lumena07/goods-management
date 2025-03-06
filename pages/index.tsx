import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSession, getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Add getServerSideProps to pre-fetch session
export async function getServerSideProps(context: any) {
  // Check for existing users first
  const userCount = await prisma.user.count()
  const session = await getSession(context)
  
  console.log('Server-side props:', {
    hasSession: !!session,
    userCount
  })

  // If no users exist, redirect to signup
  if (userCount === 0) {
    return {
      redirect: {
        destination: '/auth/signup',
        permanent: false,
      },
    }
  }

  // If user is authenticated, redirect to dashboard
  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    }
  }

  // Otherwise, return props for login page
  return {
    props: {
      session,
      userCount,
    }
  }
}

export default function Home({ userCount }: { userCount: number }) {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('Redirecting to login page...')
      router.push('/auth/login')
    }
  }, [status, router])

  // Show a simple loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 rounded-lg shadow-lg bg-white max-w-md w-full mx-4">
        <div className="mb-4 text-xl font-semibold text-gray-800">
          Welcome to Goods Management System
        </div>
        <div className="text-sm text-gray-600 mb-4">
          {status === 'loading' ? (
            'Checking authentication...'
          ) : (
            'Redirecting to login page...'
          )}
        </div>
        <div className="animate-pulse">
          <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}