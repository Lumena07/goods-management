import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Plus, ShoppingCart, Users } from "lucide-react"

export default function QuickActionsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link href="/sales/new">
          <Button className="w-full justify-start gap-2" variant="outline">
            <Plus className="h-4 w-4" />
            New Sale
          </Button>
        </Link>
        <Link href="/customers/new">
          <Button className="w-full justify-start gap-2" variant="outline">
            <Users className="h-4 w-4" />
            New Customer
          </Button>
        </Link>
        <Link href="/purchases/new">
          <Button className="w-full justify-start gap-2" variant="outline">
            <ShoppingCart className="h-4 w-4" />
            New Purchase
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
} 