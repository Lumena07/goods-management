import { PrismaClient } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientOptions = {
  log: ['error', 'warn'],
  errorFormat: 'pretty',
  datasources: process.env.DATABASE_URL
    ? { db: { url: process.env.DATABASE_URL } }
    : undefined,
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL must be set in production')
  }
}

// Create Prisma Client instance
export const prisma = global.prisma || new PrismaClient(prismaClientOptions)

// Add connection handling
async function connectWithRetry(retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting database connection (attempt ${i + 1}/${retries})`)
      await prisma.$connect()
      console.log('Successfully connected to database')
      return
    } catch (error) {
      console.error('Database connection error:', {
        attempt: i + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
        url: process.env.DATABASE_URL?.replace(
          /postgresql:\/\/([^:]+):([^@]+)@/,
          'postgresql://$1:****@'
        )
      })
      
      if (i === retries - 1) {
        console.error('All database connection attempts failed')
        throw error
      }
      
      console.log(`Retrying in ${delay/1000} seconds...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// Connect with retry in production
if (process.env.NODE_ENV === 'production') {
  connectWithRetry()
    .catch((error) => {
      console.error('Fatal: Failed to connect to database after retries:', error)
      process.exit(1)
    })
} else {
  // In development, just try once
  prisma.$connect()
    .then(() => console.log('Development: Connected to database'))
    .catch((error) => console.error('Development: Database connection failed:', error))
}

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma 