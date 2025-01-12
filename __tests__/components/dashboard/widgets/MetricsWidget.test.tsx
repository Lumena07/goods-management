import { render, screen } from '@testing-library/react'
import MetricsWidget from '@/components/dashboard/widgets/MetricsWidget'

describe('MetricsWidget', () => {
  it('formats currency correctly', () => {
    render(
      <MetricsWidget
        title="Test Metric"
        value={1000}
        type="currency"
      />
    )

    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('TZS 1,000.00')).toBeInTheDocument()
  })

  it('formats percentage correctly', () => {
    render(
      <MetricsWidget
        title="Test Percentage"
        value={75.5}
        type="percentage"
      />
    )

    expect(screen.getByText('75.5%')).toBeInTheDocument()
  })
}) 