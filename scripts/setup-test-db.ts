import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

async function setupTestDb() {
  let prisma: PrismaClient | undefined

  try {
    // Connect to default postgres database
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: "postgresql://postgres:makorokocho@localhost:5432/postgres"
        }
      }
    })

    // Drop and recreate test database
    await prisma.$executeRaw`
      DROP DATABASE IF EXISTS stationery_test_db;
    `
    
    await prisma.$executeRaw`
      CREATE DATABASE stationery_test_db;
    `

    // Ensure proper disconnection
    await prisma.$disconnect()
    prisma = undefined

    // Run schema push
    console.log('Pushing schema to test database...')
    execSync('npx prisma db push --accept-data-loss', {
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://postgres:makorokocho@localhost:5432/stationery_test_db"
      },
      stdio: 'inherit'
    })

  } catch (error) {
    console.error('Error setting up test database:', error)
    throw error
  } finally {
    // Ensure cleanup even if there's an error
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

// Run setup and handle any errors
setupTestDb().catch(error => {
  console.error('Failed to setup test database:', error)
  process.exit(1)
}) 