import '@testing-library/jest-dom'
import { mockPrisma } from './__tests__/api/mocks/setup'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}))

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
}) 