"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Package, ShoppingCart, TrendingUp } from "lucide-react"

interface Activity {
  id: string
  type: "sale" | "purchase" | "product_added" | "low_stock"
  message: string
  timestamp: Date
  amount?: number
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "sale":
        return <ShoppingCart className="h-4 w-4 text-green-600" />
      case "purchase":
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case "product_added":
        return <Package className="h-4 w-4 text-purple-600" />
      case "low_stock":
        return <Clock className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getBadgeVariant = (type: Activity["type"]) => {
    switch (type) {
      case "sale":
        return "default"
      case "purchase":
        return "secondary"
      case "product_added":
        return "outline"
      case "low_stock":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex-shrink-0 mt-1">{getIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</p>
                      <div className="flex items-center space-x-2">
                        {activity.amount && (
                          <span className="text-xs font-medium text-green-600">${activity.amount.toFixed(2)}</span>
                        )}
                        <Badge variant={getBadgeVariant(activity.type)} className="text-xs">
                          {activity.type.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
