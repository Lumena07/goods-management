import { render, screen, waitFor } from '@testing-library/react'
import AdminDashboard from '@/components/dashboard/AdminDashboard'

// Mock the fetch function
global.fetch = jest.fn()

describe('AdminDashboard', () => {
  const mockMetrics = {
    totalSales: 1000,
    totalPurchases: 800,
    outstandingBalance: 200
  }

  const mockProducts = [
    {
      id: '1',
      name: 'Test Product',
      currentStock: 5,
      minimumStock: 10
    }
  ]

  const mockActivities = [
    {
      id: '1',
      type: 'sale',
      description: 'Test Sale',
      amount: 1000,
      date: new Date().toISOString()
    }
  ]

  beforeEach(() => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/dashboard/metrics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMetrics)
        })
      }
      if (url.includes('/api/products/low-stock')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts)
        })
      }
      if (url.includes('/api/activities/recent')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockActivities)
        })
      }
      return Promise.reject(new Error('Not found'))
    })
  })

  it('renders all metrics widgets', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Total Sales')).toBeInTheDocument()
      expect(screen.getByText('TZS 1,000.00')).toBeInTheDocument()
      expect(screen.getByText('Total Purchases')).toBeInTheDocument()
      expect(screen.getByText('TZS 800.00')).toBeInTheDocument()
      expect(screen.getByText('Outstanding Balance')).toBeInTheDocument()
      expect(screen.getByText('TZS 200.00')).toBeInTheDocument()
    })
  })
}) 