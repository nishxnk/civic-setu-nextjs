"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  CheckCheck,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  complaintId?: string;
  link?: string;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  new_complaint: <FileText className="w-4 h-4 text-blue-500" />,
  status_change: <Clock className="w-4 h-4 text-yellow-500" />,
  assigned: <UserCheck className="w-4 h-4 text-purple-500" />,
  resolved: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  sla_breach: <AlertTriangle className="w-4 h-4 text-red-500" />,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = user?.token;
      if (!token) return;
      const res = await fetch("/api/notifications?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (user?.token) {
      fetchNotifications();
    }
  }, [fetchNotifications, user?.token]);

  const markAllRead = async () => {
    try {
      const token = user?.token;
      if (!token) return;
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClick = (n: Notification) => {
    // Mark as read
    if (!n.read) {
      const token = user?.token;
      if (token) {
        fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: [n._id] }),
        }).catch(console.error);
      }
    }

    // Navigate
    if (n.link) {
      router.push(n.link);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notifications
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={markAllRead}
          disabled={notifications.every((n) => n.read)}
        >
          <CheckCheck className="w-4 h-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={`cursor-pointer transition hover:shadow-md ${
                !n.read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
              }`}
              onClick={() => handleClick(n)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="mt-0.5">
                  {typeIcons[n.type] || <Bell className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!n.read ? "font-semibold" : ""}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <Badge variant="default" className="text-[10px] px-1 py-0">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-400 shrink-0 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
