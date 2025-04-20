import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { 
  Bell, 
  HelpCircle, 
  Search, 
  Check,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Notification } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export function Header({ onSearch }: { onSearch?: (term: string) => void }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
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
  });
  
  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/notifications/mark-all-read", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
  
  const unreadNotifications = notifications.filter(n => !n.isRead);
  
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="h-4 w-4 text-secondary" />;
      case "warning":
        return <X className="h-4 w-4 text-destructive" />;
      case "error":
        return <X className="h-4 w-4 text-destructive" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
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
    <header className="bg-white shadow-sm z-10 sticky top-0">
      <div className="flex items-center justify-between h-16 px-6 md:ml-64">
        {/* Search */}
        <div className="flex-1 mx-4 max-w-2xl">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <Input
              placeholder="Search for events, defects, or signals"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2"
            />
          </div>
        </div>
        
        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex justify-between items-center p-2">
                <h3 className="font-semibold">Notifications</h3>
                {unreadNotifications.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="text-xs"
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className={`px-4 py-3 hover:bg-neutral-100 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                      onSelect={() => {
                        if (!notification.isRead) {
                          markAsReadMutation.mutate(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 mr-3 ${getBgColorForType(notification.type)} p-2 rounded-full`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Help */}
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}
