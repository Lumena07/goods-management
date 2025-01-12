import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import CustomerForm from '@/components/customers/CustomerForm'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('CustomerForm', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  }

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    global.fetch = jest.fn()
  })

  it('renders empty form for new customer', () => {
    render(<CustomerForm />)

    expect(screen.getByLabelText(/name/i)).toHaveValue('')
    expect(screen.getByLabelText(/email/i)).toHaveValue('')
    expect(screen.getByLabelText(/phone/i)).toHaveValue('')
    expect(screen.getByLabelText(/accredited/i)).not.toBeChecked()
  })

  it('renders form with customer data for editing', () => {
    const customer = {
      id: '1',
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '1234567890',
      address: 'Test Address',
      isAccredited: true,
      creditLimit: 1000
    }

    render(<CustomerForm customer={customer} />)

    expect(screen.getByLabelText(/name/i)).toHaveValue(customer.name)
    expect(screen.getByLabelText(/email/i)).toHaveValue(customer.email)
    expect(screen.getByLabelText(/phone/i)).toHaveValue(customer.phone)
    expect(screen.getByLabelText(/accredited/i)).toBeChecked()
  })

  it('submits form data correctly', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1' })
    })

    render(<CustomerForm />)
    const form = screen.getByTestId('customer-form')

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'New Customer' }
    })
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '1234567890' }
    })
    fireEvent.click(screen.getByLabelText(/accredited/i))
    fireEvent.change(screen.getByLabelText(/credit limit/i), {
      target: { value: '1000' }
    })

    fireEvent.submit(form)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/customers',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('"name":"New Customer"')
        })
      )
      expect(mockRouter.push).toHaveBeenCalledWith('/customers')
    })
  })
}) 