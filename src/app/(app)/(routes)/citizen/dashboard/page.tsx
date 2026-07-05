"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { citizenAPI } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
}

interface Complaint {
  _id: string;
  title: string;
  trackingNumber: string;
  status: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentComplaints: Complaint[];
}

const statCards = [
  {
    label: "Total",
    key: "totalComplaints" as const,
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    label: "Resolved",
    key: "resolvedComplaints" as const,
    icon: CheckCircle2,
    color: "bg-green-500",
  },
  {
    label: "Pending",
    key: "pendingComplaints" as const,
    icon: Clock,
    color: "bg-amber-500",
  },
  {
    label: "In Progress",
    key: "inProgressComplaints" as const,
    icon: Loader2,
    color: "bg-purple-500",
  },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
};

export default function CitizenDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    citizenAPI
      .getDashboard()
      .then((res: unknown) => setData(res as DashboardData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 p-4">
                <Skeleton className="size-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-3 w-12" />
                  <Skeleton className="h-6 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mb-6 flex gap-4">
          <Skeleton className="h-9 w-40 rounded-lg" />
          <Skeleton className="h-9 w-44 rounded-lg" />
        </div>
        <Skeleton className="mb-3 h-6 w-40" />
        <Card>
          {Array.from({ length: 3 }).map((_, i) => (
            <CardContent
              key={i}
              className="flex items-center justify-between border-b p-4 last:border-b-0"
            >
              <div>
                <Skeleton className="mb-1 h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </CardContent>
          ))}
        </Card>
      </div>
    );
  }

  const stats = data?.stats;
  const recent = data?.recentComplaints ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">My Dashboard</h1>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map(({ label, key, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`flex size-10 items-center justify-center rounded-lg ${color}`}
              >
                <Icon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{stats?.[key] ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mb-6 flex gap-4">
        <Button
          render={<Link href="/citizen/report" />}
          className="gap-2"
        >
          <FileText className="size-4" />
          Report New Issue
        </Button>
        <Button
          variant="outline"
          render={<Link href="/citizen/complaints" />}
        >
          View All Complaints
        </Button>
      </div>

      {/* Recent complaints */}
      <h2 className="mb-3 text-lg font-semibold tracking-tight">
        Recent Complaints
      </h2>
      <Card>
        {recent.length === 0 ? (
          <CardContent className="p-6 text-center text-muted-foreground">
            No complaints yet.
          </CardContent>
        ) : (
          recent.map((c) => (
            <CardContent
              key={c._id}
              className="flex items-center justify-between border-b p-4 last:border-b-0"
            >
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {c.trackingNumber}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusBadge(c.status)}`}
              >
                {c.status}
              </span>
            </CardContent>
          ))
        )}
      </Card>
    </div>
  );
}
