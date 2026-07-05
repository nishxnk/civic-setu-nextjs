"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api-client";
import { config } from "@/config/config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, FileText } from "lucide-react";

export default function AdminDepartmentsPage() {
  const [stats, setStats] = useState<Array<{ _id: string; total: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then((res: unknown) => {
        const data = res as { departmentStats?: Array<{ _id: string; total: number }> };
        setStats(data.departmentStats || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const deptMap = new Map(stats.map((s) => [s._id, s.total]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Building2 className="w-6 h-6" />
        Departments
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {config.domain.departments.map((dept) => {
          const count = deptMap.get(dept.id) || 0;
          return (
            <Card key={dept.id} className="hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize mt-1">{dept.id}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-orange-200" />
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-muted-foreground">complaints</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
