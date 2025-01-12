import { render, fireEvent, waitFor } from '@testing-library/react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Login from '@/pages/auth/login'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn()
}))

describe('Login Component', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should handle successful login', async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({
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
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should display error message on failed login', async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({
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