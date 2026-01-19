import { useState } from "react";
import { Bell, MessageCircle, BookOpen, Flag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Notification, NotificationType } from "@/types";
import { useNavigate } from "react-router-dom";

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: "n1",
    userId: "u1",
    type: "comment_on_path",
    title: "New Comment",
    message: "Jane Smith commented on your path 'React Fundamentals'",
    linkTo: "/path/p1",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
  },
  {
    id: "n2",
    userId: "u1",
    type: "reply_to_comment",
    title: "New Reply",
    message: "Alex Johnson replied to your comment",
    linkTo: "/path/p2",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    id: "n3",
    userId: "u1",
    type: "path_published",
    title: "Path Published",
    message: "Your path 'Advanced TypeScript' has been published",
    linkTo: "/path/p3",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "n4",
    userId: "u1",
    type: "report_received",
    title: "New Report",
    message: "A user reported a comment on 'React Fundamentals'",
    linkTo: "/admin",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "comment_on_path":
    case "reply_to_comment":
      return <MessageCircle className="h-4 w-4" />;
    case "path_published":
    case "path_updated":
      return <BookOpen className="h-4 w-4" />;
    case "report_received":
      return <Flag className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
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
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.linkTo) {
      navigate(notification.linkTo);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
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
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
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
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 p-2 rounded-full",
                      notification.isRead
                        ? "bg-secondary text-muted-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        !notification.isRead && "text-foreground"
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
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
