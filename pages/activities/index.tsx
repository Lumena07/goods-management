import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ShoppingCart, CreditCard, Store, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useRouter } from 'next/router'

interface Activity {
  id: string
  type: 'sale' | 'purchase' | 'payment'
  description: string
  amount: number
  date: string
}

export default function ActivitiesPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 20

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/activities/recent?page=${page}&limit=${pageSize}`)
        if (!response.ok) {
          throw new Error('Failed to fetch activities')
        }
        const data = await response.json()
        if (data.length < pageSize) {
          setHasMore(false)
        }
        setActivities(prev => page === 1 ? data : [...prev, ...data])
      } catch (error) {
        console.error('Error fetching activities:', error)
        setError('Failed to load activities')
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [page])

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

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1e3a8a]">All Activities</h1>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {loading && page === 1 ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : activities.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No activities found.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center gap-4 p-4 border-b last:border-0"
                >
                  <div className="rounded-full bg-gray-50 p-2">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1e3a8a]">
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

            {hasMore && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 