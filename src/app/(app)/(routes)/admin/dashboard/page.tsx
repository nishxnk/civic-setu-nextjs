"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, CheckCircle2, Clock, Loader2, Users } from "lucide-react";

interface DashboardData {
  stats?: {
    totalComplaints: number;
    resolvedComplaints: number;
    pendingComplaints: number;
    inProgressComplaints: number;
    totalUsers?: number;
  };
  departmentStats?: Array<{ _id: string; total: number }>;
  recentComplaints?: Array<{
    _id: string;
    title: string;
    status: string;
    priority: string;
    trackingNumber: string;
    citizen: { name: string };
    createdAt: string;
  }>;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  "in-progress": "default",
  resolved: "outline",
  rejected: "destructive",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getDashboard()
      .then((res: unknown) => setData(res as DashboardData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data.stats;
  const statCards = [
    { label: "Total", value: stats?.totalComplaints ?? 0, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Resolved", value: stats?.resolvedComplaints ?? 0, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending", value: stats?.pendingComplaints ?? 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "In Progress", value: stats?.inProgressComplaints ?? 0, icon: Loader2, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((c) => (
          <Card key={c.label} className="overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${c.bg}`}>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Complaints */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Citizen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.recentComplaints || []).map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-mono text-xs">{c.trackingNumber}</TableCell>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{c.citizen?.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[c.status] || "secondary"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{c.priority}</TableCell>
                </TableRow>
              ))}
              {(data.recentComplaints || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No complaints found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
