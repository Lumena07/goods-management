import React from 'react'
import { Card, CardContent } from "@/components/ui/card"

interface MetricsWidgetProps {
  title: string
  value: number
  type: 'currency' | 'number' | 'percentage'
}

export default function MetricsWidget({ title, value, type }: MetricsWidgetProps) {
  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'TZS'
        }).format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString()
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-primary">
          {formatValue(value, type)}
        </p>
      </CardContent>
    </Card>
  )
} 