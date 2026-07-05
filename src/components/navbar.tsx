"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/app/(app)/layout";
import { useAuth } from "@/context/AuthContext";
import { config } from "@/config/config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  LogOut,
  UserCircle,
  Menu,
  MapPin,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

interface NotificationItem {
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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Navbar() {
  const { userDetails, role } = useUser();
  const { user } = useAuth();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = user?.token;
      if (!token) return;
      const res = await fetch("/api/notifications?unread=true&limit=1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // Silently fail
    }
  }, [user?.token]);

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch recent 5 notifications when dropdown opens
  const fetchRecentNotifications = useCallback(async () => {
    try {
      const token = user?.token;
      if (!token) return;
      const res = await fetch("/api/notifications?limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecentNotifications(data.notifications || []);
      }
    } catch {
      // Silently fail
    }
  }, [user?.token]);

  const handleDropdownOpenChange = (open: boolean) => {
    setDropdownOpen(open);
    if (open) {
      fetchRecentNotifications();
    }
  };

  // Mark a single notification as read and navigate
  const handleNotificationClick = async (n: NotificationItem) => {
    try {
      const token = user?.token;
      if (!token) return;
      if (!n.read) {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: [n._id] }),
        });
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Silently fail
    }

    setDropdownOpen(false);

    if (n.link) {
      router.push(n.link);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-between h-14 px-4 bg-white border-b">
      {/* Left */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-700 hidden md:block">
          {config.app.title}
        </span>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Ward Selector (placeholder) */}
        <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-xs">
          <MapPin className="w-3.5 h-3.5" />
          All Wards
        </Button>

        {/* Notification Bell */}
        <DropdownMenu onOpenChange={handleDropdownOpenChange}>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="relative" title="Notifications">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-[#15227a]">
                  {unreadCount} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {recentNotifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <>
                {recentNotifications.map((n) => (
                  <DropdownMenuItem
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className="flex items-start gap-3 py-2 px-2 cursor-pointer"
                  >
                    <div className="mt-0.5 shrink-0">
                      {typeIcons[n.type] || <Bell className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p
                          className={`text-sm truncate ${
                            !n.read ? "font-semibold text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/notifications");
                  }}
                  className="justify-center text-sm font-medium text-[#15227a] cursor-pointer"
                >
                  View All Notifications
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="flex items-center gap-2 h-auto p-1">
              <Avatar className="w-7 h-7 ring-2 ring-[#15227a]/20">
                <AvatarFallback className="bg-[#15227a] text-white text-xs font-semibold">
                  {userDetails?.displayName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium leading-tight">
                  {userDetails?.displayName || "User"}
                </p>
                <Badge variant="outline" className="text-[10px] capitalize px-1 py-0 leading-tight">
                  {role}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <p className="text-sm">{userDetails?.displayName || "User"}</p>
              <p className="text-xs text-muted-foreground">{userDetails?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/${role}/profile`)}>
              <UserCircle className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
