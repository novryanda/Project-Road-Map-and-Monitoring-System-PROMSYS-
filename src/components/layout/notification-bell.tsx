"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteReadNotifications,
  getNotificationLink,
} from "@/hooks/use-notifications";
import type { Notification } from "@/hooks/use-notifications";

const TYPE_ICONS: Record<string, string> = {
  TASK_ASSIGNED: "📋",
  TASK_SUBMITTED: "📤",
  TASK_APPROVED: "✅",
  TASK_REVISION: "🔄",
  INVOICE_CREATED: "🧾",
  REIMBURSEMENT_SUBMITTED: "📝",
  REIMBURSEMENT_APPROVED: "✅",
  REIMBURSEMENT_REJECTED: "❌",
  REIMBURSEMENT_PAID: "💳",
  PROJECT_ASSIGNED: "👥",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notificationsRes } = useNotifications();
  const notifications = notificationsRes?.data || [];
  const { data: unreadData } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteRead = useDeleteReadNotifications();

  const unreadCount = unreadData?.count ?? 0;
  const readCount = notifications.filter((n) => n.isRead).length;

  const handleClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markRead.mutateAsync(notification.id);
    }
    const link = getNotificationLink(notification);
    if (link) {
      window.location.href = link;
      setOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync();
  };

  const handleDeleteRead = async () => {
    await deleteRead.mutateAsync();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          <div className="flex items-center gap-1">
            {readCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs h-auto py-1 text-destructive hover:text-destructive" onClick={handleDeleteRead}>
                Clear read
              </Button>
            )}
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${!n.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                    }`}
                  onClick={() => handleClick(n)}
                >
                  <span className="mt-0.5 text-base">{TYPE_ICONS[n.type] || "📢"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.isRead ? "font-medium" : ""}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

