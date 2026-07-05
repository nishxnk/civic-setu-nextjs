"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { citizenAPI } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Search, FileText, ExternalLink, Plus,
} from "lucide-react";
import { getStatusConfig } from "@/config/config";

export default function CitizenComplaintsPage() {
  const [complaints, setComplaints] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    citizenAPI.getComplaints()
      .then((res: unknown) => setComplaints((res as { complaints: Array<Record<string, unknown>> }).complaints || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? complaints.filter((c) => {
        const q = search.toLowerCase();
        return (
          ((c.title as string)?.toLowerCase().includes(q)) ||
          ((c.trackingNumber as string)?.toLowerCase().includes(q)) ||
          ((c.category as string)?.toLowerCase().includes(q))
        );
      })
    : complaints;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Complaints</h1>
        <Link href="/citizen/report">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Report New
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by title, tracking number, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{search ? "No complaints match your search" : "No complaints yet"}</p>
            {!search && (
              <Link href="/citizen/report">
                <Button variant="link" className="mt-2">File your first complaint</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const statusConfig = getStatusConfig(c.status as string);
            return (
              <Card key={c._id as string} className="hover:shadow-md transition">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-800 truncate">{c.title as string}</h3>
                      {statusConfig && (
                        <Badge variant="outline" className={statusConfig.color + " text-xs"}>
                          {statusConfig.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-mono">{c.trackingNumber as string}</span>
                      <span className="mx-2">&middot;</span>
                      <span className="capitalize">{c.category as string}</span>
                      <span className="mx-2">&middot;</span>
                      <span>{new Date(c.createdAt as string).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 shrink-0 ml-3" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
