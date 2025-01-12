export const mockPrisma = {
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({})
  },
  customer: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({})
  },
  customPrice: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({})
  },
  sale: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    aggregate: jest.fn().mockResolvedValue({ _sum: { total: 0 } })
  },
  product: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    fields: {
      minimumStock: 'minimumStock'
    }
  },
  purchase: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({}),
    aggregate: jest.fn().mockResolvedValue({ _sum: { total: 0 } })
  },
  purchaseItem: {
    update: jest.fn().mockResolvedValue({})
  },
  $transaction: jest.fn().mockResolvedValue({}),
  payment: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
    aggregate: jest.fn().mockResolvedValue({ _sum: { total: 0 } })
  }
}

// Mock next-auth
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => null)
}))

// Mock next-auth/next
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
})) 