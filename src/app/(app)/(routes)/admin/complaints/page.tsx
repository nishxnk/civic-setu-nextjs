"use client";

import { useState, useEffect, useMemo } from "react";
import { complaintsAPI } from "@/lib/api-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Complaint {
  _id: string;
  trackingNumber: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  [key: string]: unknown;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  pending: "secondary",
  "in-progress": "default",
  resolved: "outline",
  rejected: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock className="size-3" />,
  "in-progress": <SlidersHorizontal className="size-3" />,
  resolved: <CheckCircle2 className="size-3" />,
  rejected: <XCircle className="size-3" />,
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    complaintsAPI
      .getAll()
      .then((res: unknown) =>
        setComplaints(
          (res as { complaints: Complaint[] }).complaints || []
        )
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    const previous = complaints.find((c) => c._id === id);
    // Optimistic update
    setComplaints((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status } : c))
    );
    try {
      await complaintsAPI.update(id, { status });
    } catch (e) {
      console.error(e);
      // Revert on failure
      if (previous) {
        setComplaints((prev) =>
          prev.map((c) => (c._id === id ? previous : c))
        );
      }
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return complaints;
    const q = search.toLowerCase();
    return complaints.filter(
      (c) =>
        c.trackingNumber?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q)
    );
  }, [complaints, search]);

  const statusOptions = ["pending", "in-progress", "resolved", "rejected"];

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-full max-w-sm mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────
  if (!complaints.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">All Complaints</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="size-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">
              No complaints yet
            </p>
            <p className="text-sm text-muted-foreground">
              Complaints submitted by citizens will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">All Complaints</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              Complaints
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filtered.length}
                {search && filtered.length !== complaints.length
                  ? ` of ${complaints.length}`
                  : ""}
                )
              </span>
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by title, tracking #, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="size-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">
                No matching complaints
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search term.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-mono text-xs">
                      {c.trackingNumber}
                    </TableCell>
                    <TableCell className="max-w-48 truncate">
                      {c.title}
                    </TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[c.status] ?? "default"}>
                        <span className="flex items-center gap-1">
                          {STATUS_ICON[c.status] ?? null}
                          {STATUS_LABEL[c.status] ?? c.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs capitalize">
                      {c.priority}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={c.status}
                        onValueChange={(value) => {
                          if (value) handleStatusChange(c._id as string, value as string);
                        }}
                      >
                        <SelectTrigger size="sm" className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {STATUS_LABEL[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
