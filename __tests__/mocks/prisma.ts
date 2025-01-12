export const mockPrisma = {
  sale: {
    aggregate: jest.fn(),
  },
  purchase: {
    aggregate: jest.fn(),
  },
  payment: {
    aggregate: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
  }
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
})) 