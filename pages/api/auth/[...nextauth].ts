import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

console.log('Initializing NextAuth configuration')

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide NEXTAUTH_SECRET environment variable')
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Attempting authorization...')
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })
          console.log('User lookup result:', user ? 'Found' : 'Not Found')

          if (!user) {
            console.log('No user found with email:', credentials.email)
            return null
          }

          if (!user.isApproved) {
            throw new Error('Account is pending approval')
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          console.log('Password validation:', isValid ? 'Valid' : 'Invalid')

          if (!isValid) {
            console.log('Invalid password')
            return null
          }

          console.log('Authorization successful')
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT Callback:', { tokenExists: !!token, userExists: !!user })
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session Callback:', { sessionExists: !!session, tokenExists: !!token })
      if (token && session.user) {
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  }
}

const handler = NextAuth(authOptions)

export default handler 