import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MetricsWidget from './widgets/MetricsWidget'
import LowStockWidget from './widgets/LowStockWidget'
import RecentActivitiesWidget from './widgets/RecentActivitiesWidget'

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalPurchases: 0,
    outstandingBalance: 0
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics')
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1e3a8a]">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'TZS'
              }).format(metrics.totalSales)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1e3a8a]">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'TZS'
              }).format(metrics.totalPurchases)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1e3a8a]">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'TZS'
              }).format(metrics.outstandingBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LowStockWidget />
        </div>
        <div className="lg:col-span-1">
          <RecentActivitiesWidget />
        </div>
      </div>
    </div>
  )
} 