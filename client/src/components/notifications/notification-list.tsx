import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, AlertCircle, Info, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Notification } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";

export function NotificationList() {
  const { toast } = useToast();
  
  // Fetch notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });
  
  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/notifications/${id}/read`, {});
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to mark notification as read: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/notifications/mark-all-read", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: "All notifications marked as read.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to mark all notifications as read: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const unreadNotifications = notifications.filter(n => !n.isRead);
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5 text-secondary" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "error":
        return <X className="h-5 w-5 text-destructive" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };
  
  const getBgColorForType = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "warning":
        return "bg-yellow-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };
  
  const formatNotificationTime = (dateStr: Date) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Notifications</CardTitle>
        {unreadNotifications.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            Mark all as read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-lg">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              You don't have any notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg ${!notification.isRead ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 mr-3 ${getBgColorForType(notification.type)} p-2 rounded-full`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span className="text-xs text-gray-500">{formatNotificationTime(notification.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    
                    <div className="flex justify-end mt-2">
                      {!notification.isRead && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
