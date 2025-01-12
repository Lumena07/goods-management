import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ShoppingCart, CreditCard, Store } from "lucide-react"

interface Activity {
  id: string
  type: 'sale' | 'purchase' | 'payment'
  description: string
  amount: number
  date: string
}

export default function RecentActivitiesWidget() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities/recent')
        if (!response.ok) {
          throw new Error('Failed to fetch activities')
        }
        const data = await response.json()
        setActivities(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching activities:', error)
        setError('Failed to load recent activities')
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="h-4 w-4 text-green-500" />
      case 'purchase':
        return <Store className="h-4 w-4 text-blue-500" />
      default:
        return <CreditCard className="h-4 w-4 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No recent activities.
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="rounded-full bg-background p-1 shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#1e3a8a] truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {format(new Date(activity.date), 'MMM d, yyyy')}
                    </span>
                    <span className="font-medium text-[#1e3a8a]">
                      TZS {activity.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 