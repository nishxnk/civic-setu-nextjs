"use client";

import React, { useEffect, useState, useCallback, createContext, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/context/AuthContext";
import { IAuthUser } from "@/types/user";
import { Badge } from "@/components/ui/badge";

// ── Contexts ────────────────────────────────────────────

interface UserContextType {
  userDetails: IAuthUser | null;
  isAdmin: boolean;
  isWorker: boolean;
  isCitizen: boolean;
  role: string;
}

interface WardContextType {
  selectedWardId: string | null;
  setSelectedWardId: (id: string | null) => void;
}

const UserContext = createContext<UserContextType>({
  userDetails: null,
  isAdmin: false,
  isWorker: false,
  isCitizen: false,
  role: "citizen",
});

const WardContext = createContext<WardContextType>({
  selectedWardId: null,
  setSelectedWardId: () => {},
});

export const useUser = () => useContext(UserContext);
export const useWard = () => useContext(WardContext);

// ── Auth Wrapper ─────────────────────────────────────────

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.replace("/login");
    }
  }, [mounted, loading, user, router]);

  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const role = user.role || "citizen";
  const userCtx: UserContextType = {
    userDetails: user,
    isAdmin: role === "admin",
    isWorker: role === "worker",
    isCitizen: role === "citizen",
    role,
  };

  return (
    <UserContext.Provider value={userCtx}>
      <WardContext.Provider value={{
        selectedWardId: null,
        setSelectedWardId: () => {},
      }}>
        {children}
      </WardContext.Provider>
    </UserContext.Provider>
  );
}

// ── Dashboard Shell ──────────────────────────────────────

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved) setIsSidebarCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth <= 1280) {
        setIsSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  return (
    <div className="h-[100dvh] flex" dir="ltr">
      {/* Sidebar */}
      <div
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 z-[20] transition-all duration-300 ${
          isSidebarCollapsed ? "md:w-16" : "md:w-56"
        }`}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          isMobile={false}
        />
      </div>

      {/* Main */}
      <div
        className={`flex-1 min-w-0 flex flex-col h-[100dvh] transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-16" : "md:ml-56"
        }`}
      >
        {/* Mobile sidebar */}
        <div className="md:hidden">
          <Sidebar
            isCollapsed={false}
            onToggle={toggleSidebar}
            isMobile={true}
          />
        </div>

        {/* Navbar */}
        <div className="flex-shrink-0 bg-background border-b z-[30]">
          <Navbar />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-gray-50/80 min-h-0">
          <div className="min-w-0 p-6 pb-24">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Layout Export ────────────────────────────────────────

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper>
      <DashboardShell>{children}</DashboardShell>
    </AuthWrapper>
  );
}
