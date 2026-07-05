"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/app/(app)/layout";
import { config } from "@/config/config";
import { systemModules } from "@/constants/systemModules";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Building2,
  ClipboardList,
  ClipboardCheck,
  UserCircle,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Menu,
  ChevronLeft,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Building2: <Building2 className="w-5 h-5" />,
  ClipboardList: <ClipboardList className="w-5 h-5" />,
  ClipboardCheck: <ClipboardCheck className="w-5 h-5" />,
  UserCircle: <UserCircle className="w-5 h-5" />,
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

export default function Sidebar({ isCollapsed, onToggle, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userDetails, role } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleModules = systemModules.filter(
    (m) => m.roles.includes(role)
  );

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Header — OXmaint-style navy bar */}
      <div className={cn(
        "bg-[#15227a] flex items-center border-b border-[#15227a]",
        isCollapsed ? "justify-center h-14 px-2" : "h-14 px-4 justify-between"
      )}>
        {!isCollapsed ? (
          <Link href={`/${role}/dashboard`} className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-linear-to-br from-white/20 to-white/5 rounded-lg flex items-center justify-center border border-white/20">
              <span className="text-white font-bold text-xs">CS</span>
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold text-white tracking-tight">
                {config.app.sidebarTitle}
              </span>
              <span className="text-sm font-bold text-orange-400 tracking-tight ml-0.5">
                {config.app.sidebarSubTitle}
              </span>
            </div>
          </Link>
        ) : (
          <div className="w-7 h-7 bg-linear-to-br from-white/20 to-white/5 rounded-lg flex items-center justify-center border border-white/20">
            <span className="text-white font-bold text-xs">CS</span>
          </div>
        )}
        {!isMobile && !isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={onToggle}
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        )}
        {!isMobile && isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10 absolute -right-3 top-3 w-6 h-6 rounded-full bg-[#15227a] border border-white/20"
            onClick={onToggle}
          >
            <ChevronLeft className="w-3 h-3 rotate-180" />
          </Button>
        )}
      </div>

      {/* Nav Items */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-0.5 px-3">
          {visibleModules.map((mod) => {
            const href = mod.id === "profile" ? "/profile" : `/${role}/${mod.id === "dashboard" ? "dashboard" : mod.id}`;
            const isActive = pathname.startsWith(href);

            const linkContent = (
              <Link
                key={mod.id}
                href={href}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-[#15227a]/8 text-[#15227a] font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  isCollapsed ? "justify-center h-9 w-9 mx-auto" : "px-3 py-2.5 gap-3"
                )}
              >
                <span className={cn(
                  isActive ? "text-[#15227a]" : "text-gray-400"
                )}>
                  {iconMap[mod.icon] || <FileText className="w-5 h-5" />}
                </span>
                {!isCollapsed && <span className="text-sm">{mod.name}</span>}
                {isActive && !isCollapsed && (
                  <span className="ml-auto w-1 h-5 bg-[#15227a] rounded-full" />
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={mod.id}>
                  <TooltipTrigger>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#15227a] text-white text-xs">
                    {mod.name}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return linkContent;
          })}
        </nav>
      </ScrollArea>

      {/* Footer — User Info */}
      <div className="border-t bg-gray-50/50 p-3">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
          <Avatar className="w-8 h-8 shrink-0 ring-2 ring-[#15227a]/20">
            <AvatarFallback className="bg-[#15227a] text-white text-xs font-semibold">
              {userDetails?.displayName?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {userDetails?.displayName || "User"}
              </p>
              <p className="text-[11px] text-gray-500 capitalize">{role}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "mt-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors text-xs",
            isCollapsed ? "w-full justify-center px-0" : "w-full justify-start gap-2"
          )}
        >
          <LogOut className="w-3.5 h-3.5" />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </div>
  );

  // Mobile
  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="px-4 py-3 bg-[#15227a]">
              <SheetTitle className="text-white text-sm">{config.app.title}</SheetTitle>
            </SheetHeader>
            {navContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop
  return (
    <aside className="h-full bg-white flex flex-col shadow-sm">
      {navContent}
    </aside>
  );
}
