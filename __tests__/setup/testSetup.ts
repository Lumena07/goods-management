import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function setupTestDatabase() {
  // Reset database to clean state
  execSync('npx prisma migrate reset --force')
  
  // Add test data
  const supplier = await prisma.supplier.create({
    data: {
      name: 'Test Supplier',
      email: 'test@supplier.com',
      phone: '1234567890',
      address: 'Test Address'
    }
  })

  const product = await prisma.product.create({
    data: {
      name: 'Test Product',
      basePrice: 100,
      currentStock: 20,
      minStock: 10
    }
  })

  const customer = await prisma.customer.create({
    data: {
      name: 'Test Customer',
      email: 'test@customer.com',
      phone: '0987654321',
      isAccredited: true
    }
  })

  return { supplier, product, customer }
}

export { prisma, setupTestDatabase } 