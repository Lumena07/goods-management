import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
    }
  }
})

async function setupTestDatabase() {
  try {
    // Create database if it doesn't exist
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stationery_test_db') THEN
          CREATE DATABASE stationery_test_db;
        END IF;
      END $$;
    `

    // Clean the database
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ')

    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)
    } catch (error) {
      console.log('No tables to truncate')
    }

    // Create test admin user
    const hashedPassword = await import('bcryptjs').then(bcrypt => 
      bcrypt.hash('admin123', 10)
    )

    await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        isApproved: true
      }
    })

  } catch (error) {
    console.error('Error setting up test database:', error)
    throw error
  }
}

export { setupTestDatabase, prisma } 