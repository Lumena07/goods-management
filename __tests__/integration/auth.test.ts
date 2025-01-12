import { createMocks } from 'node-mocks-http'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signIn } from 'next-auth/react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import Login from '../../pages/auth/login'

const prisma = new PrismaClient()

jest.mock('next-auth/react', () => ({
  signIn: jest.fn()
}))

describe('Authentication Flow', () => {
  beforeAll(async () => {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10)
    await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        isApproved: true
      }
    })
  })

  afterAll(async () => {
    await prisma.user.deleteMany()
  })

  it('should handle successful login', async () => {
    ;(signIn as jest.Mock).mockResolvedValueOnce({
      error: null,
      status: 200,
      ok: true
    })

    const { getByPlaceholderText, getByRole } = render(<Login />)

    fireEvent.change(getByPlaceholderText('Email address'), {
      target: { value: 'admin@example.com' }
    })
    fireEvent.change(getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    })

    fireEvent.click(getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'admin@example.com',
        password: 'password123'
      })
    })
  })

  it('should display error message on failed login', async () => {
    ;(signIn as jest.Mock).mockResolvedValueOnce({
      error: 'Invalid credentials',
      status: 401
    })

    const { getByPlaceholderText, getByRole, findByText } = render(<Login />)

    fireEvent.change(getByPlaceholderText('Email address'), {
      target: { value: 'wrong@example.com' }
    })
    fireEvent.change(getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' }
    })

    fireEvent.click(getByRole('button', { name: /sign in/i }))

    const errorMessage = await findByText('Invalid credentials')
    expect(errorMessage).toBeInTheDocument()
  })
}) 