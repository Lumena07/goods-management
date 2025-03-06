import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Log environment details
console.log('=== NextAuth Configuration ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('VERCEL_URL:', process.env.VERCEL_URL || 'not set')
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
console.log('============================')

// Validate critical environment variables
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
}

// In production, use VERCEL_URL if NEXTAUTH_URL is not set
if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
    console.log('Using VERCEL_URL as NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
  }
  
  if (!process.env.NEXTAUTH_URL) {
    throw new Error('NEXTAUTH_URL must be set in production')
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
          
        if (!user) {
          throw new Error('No user found with this email')
        }

        if (!user.isApproved) {
          throw new Error('Account is pending approval')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role
      }
      return session
    }
  },
  events: {
    async signIn({ user }) {
      console.log('User signed in:', user.email)
    }
  }
}

export default NextAuth(authOptions) 