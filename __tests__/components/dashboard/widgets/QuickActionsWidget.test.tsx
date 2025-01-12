import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/router'
import QuickActionsWidget from '@/components/dashboard/widgets/QuickActionsWidget'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('QuickActionsWidget', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
  })

  it('navigates to correct routes when buttons are clicked', () => {
    render(<QuickActionsWidget />)

    fireEvent.click(screen.getByText('Record Sale'))
    expect(mockPush).toHaveBeenCalledWith('/sales/new')

    fireEvent.click(screen.getByText('Record Purchase'))
    expect(mockPush).toHaveBeenCalledWith('/purchases/new')
  })
}) 