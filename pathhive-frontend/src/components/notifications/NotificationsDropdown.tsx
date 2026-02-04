import { useState, useEffect } from "react";
// 1. IMPORT ShieldAlert
import { Bell, MessageCircle, Flag, Check, Star, UserPlus, ShieldAlert } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { notificationService, Notification as ApiNotification } from "@/lib/notificationService";

interface UINotification {
  id: string;
  type: string;
  title: string;
  message: string;
  linkTo: string;
  isRead: boolean;
  createdAt: Date;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "comment":
    case "reply":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "enrollment":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "review":
      return <Star className="h-4 w-4 text-yellow-500" />;
    // 2. FIX: Handle 'report' explicitly with a new Icon
    case "report":
    case "report_received":
      return <ShieldAlert className="h-4 w-4 text-red-600" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationTitle = (type: string): string => {
    switch (type) {
        case 'comment': return "New Comment";
        case 'reply': return "New Reply";
        case 'enrollment': return "New Student";
        case 'review': return "New Review";
        // 3. FIX: Add Title for Report
        case 'report':
        case 'report_received': 
            return "Content Reported"; 
        default: return "Notification";
    }
};

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function NotificationsDropdown() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      
      const adaptedData: UINotification[] = data.map((n: ApiNotification) => ({
        id: n.id.toString(),
        type: n.notification_type,
        title: getNotificationTitle(n.notification_type),
        message: n.message,
        linkTo: n.path ? `/path/${n.path}` : '#',
        isRead: n.is_read,
        createdAt: new Date(n.created_at),
      }));

      setNotifications(adaptedData);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: UINotification) => {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      await notificationService.markAsRead(Number(notification.id));
    }

    if (notification.linkTo && notification.linkTo !== '#') {
      navigate(notification.linkTo);
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await notificationService.markAllAsRead();
  };

  return (
    <DropdownMenu 
      onOpenChange={(isOpen) => {
        if (isOpen) fetchNotifications();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium shadow-sm border-2 border-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 bg-popover" align="end" forceMount>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground h-auto py-1"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0",
                    !notification.isRead && "bg-blue-50/50"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 p-2 rounded-full shrink-0",
                      notification.isRead
                        ? "bg-secondary text-muted-foreground"
                        : "bg-white border shadow-sm"
                    )}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        !notification.isRead ? "text-foreground font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className={cn(
                        "text-xs line-clamp-2 mt-0.5",
                        !notification.isRead ? "text-slate-600" : "text-muted-foreground"
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}