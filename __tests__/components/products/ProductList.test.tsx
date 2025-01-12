import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProductList from '@/components/products/ProductList'
import { useSession } from 'next-auth/react'

jest.mock('next-auth/react')

describe('ProductList', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'ADMIN' } },
      status: 'authenticated'
    })
  })

  it('handles pagination', async () => {
    render(<ProductList />)
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)
    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeInTheDocument()
    })
  })

  it('filters products', async () => {
    render(<ProductList />)
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })
    await waitFor(() => {
      // Verify filtered results
    })
  })

  it('handles stock updates', async () => {
    // Test stock adjustment functionality
  })
}) 