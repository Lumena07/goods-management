import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Enhanced environment logging
console.log('=== NextAuth Configuration Debug ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('VERCEL_URL:', process.env.VERCEL_URL || 'not set')
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set')
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
console.log('===================================')

// Validate critical environment variables
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars)
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
}

// In production, use VERCEL_URL if NEXTAUTH_URL is not set
if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
    console.log('Using VERCEL_URL as NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
  }
  
  if (!process.env.NEXTAUTH_URL) {
    console.error('NEXTAUTH_URL is required in production')
    throw new Error('NEXTAUTH_URL must be set in production')
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('=== Authorization Debug ===')
        console.log('Credentials received:', { email: credentials?.email, password: credentials?.password ? '[REDACTED]' : undefined })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          throw new Error('Email and password required')
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })
          
          console.log('User found:', user ? { id: user.id, email: user.email, isApproved: user.isApproved } : 'No user found')
          
          if (!user) {
            throw new Error('No user found with this email')
          }

          if (!user.isApproved) {
            throw new Error('Account is pending approval')
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          console.log('Password validation:', isValid ? 'Valid' : 'Invalid')

          if (!isValid) {
            throw new Error('Invalid password')
          }

          const userToReturn = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
          console.log('Returning user:', userToReturn)
          console.log('=== End Authorization Debug ===')
          return userToReturn
        } catch (error) {
          console.error('Authorization error:', error)
          throw error
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
      console.log('=== JWT Callback Debug ===')
      console.log('Token:', token)
      console.log('User:', user)
      if (user) {
        token.role = user.role
      }
      console.log('Modified token:', token)
      console.log('=== End JWT Callback Debug ===')
      return token
    },
    async session({ session, token }) {
      console.log('=== Session Callback Debug ===')
      console.log('Session:', session)
      console.log('Token:', token)
      if (token && session.user) {
        session.user.role = token.role
      }
      console.log('Modified session:', session)
      console.log('=== End Session Callback Debug ===')
      return session
    }
  },
  debug: true, // Enable debug mode
  events: {
    async signIn({ user }) {
      console.log('=== Sign In Event Debug ===')
      console.log('User signed in:', user)
      console.log('=== End Sign In Event Debug ===')
    }
  }
}

export default NextAuth(authOptions) 