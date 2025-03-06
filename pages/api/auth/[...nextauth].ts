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
  debug: process.env.NODE_ENV !== 'production',
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    signOut: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Attempting authorization for:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })
          
          if (!user) {
            console.log('No user found with email:', credentials.email)
            return null
          }

          if (!user.isApproved) {
            console.log('User not approved:', credentials.email)
            throw new Error('Account is pending approval')
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          console.log('Password validation result:', isValid)

          if (!isValid) {
            console.log('Invalid password for user:', credentials.email)
            return null
          }

          console.log('Authorization successful for:', credentials.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Authorization error:', error)
          throw error // Let NextAuth handle the error
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log('SignIn Callback:', { 
          user: user?.email,
          provider: account?.provider
        })
        
        // Only allow credentials provider
        if (account?.provider !== 'credentials') {
          console.log('Rejected non-credentials provider:', account?.provider)
          return false
        }
        return true
      } catch (error) {
        console.error('SignIn Callback Error:', error)
        return false
      }
    },
    async jwt({ token, user }) {
      try {
        console.log('JWT Callback:', { 
          tokenExists: !!token,
          userEmail: user?.email
        })
        if (user) {
          token.role = user.role
        }
        return token
      } catch (error) {
        console.error('JWT Callback Error:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        console.log('Session Callback:', { 
          sessionExists: !!session,
          userEmail: session?.user?.email
        })
        if (token && session.user) {
          session.user.role = token.role
        }
        return session
      } catch (error) {
        console.error('Session Callback Error:', error)
        return session
      }
    }
  },
  events: {
    async signIn(message) { 
      console.log('SignIn Event:', {
        user: message.user.email,
        isNewUser: message.isNewUser
      })
    },
    async signOut(message) { 
      console.log('SignOut Event:', {
        session: message.session
      })
    },
    async session(message) { 
      console.log('Session Event:', {
        session: message.session
      })
    }
  }
}

const handler = NextAuth(authOptions)

export default handler 