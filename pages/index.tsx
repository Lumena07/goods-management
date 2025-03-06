import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useSession, getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Add getServerSideProps to pre-fetch session
export async function getServerSideProps(context: any) {
  try {
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

    // If user is not authenticated, redirect to login
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    }
  } catch (error) {
    console.error('Error in getServerSideProps:', error)
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    }
  } finally {
    await prisma.$disconnect()
  }
}

// The component itself will never be rendered because we always redirect
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 rounded-lg shadow-lg bg-white max-w-md w-full mx-4">
        <div className="mb-4 text-xl font-semibold text-gray-800">
          Welcome to Goods Management System
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Redirecting...
        </div>
        <div className="animate-pulse">
          <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}