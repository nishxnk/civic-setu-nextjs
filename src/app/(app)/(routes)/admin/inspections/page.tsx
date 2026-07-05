"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ClipboardCheck, Calendar, Users, MapPin, Clock, Plus, Building2,
} from "lucide-react";

interface InspectionSchedule {
  _id: string;
  title: string;
  description: string;
  department: string;
  category: string;
  frequency: string;
  checklist: Array<{ task: string; required: boolean }>;
  assignedWorkers: Array<{ _id: string; name: string }>;
  assets: Array<{ _id: string; name: string; assetCode: string }>;
  ward?: string;
  nextScheduledDate: string;
  lastExecutedDate?: string;
  isActive: boolean;
}

const freqColors: Record<string, string> = {
  daily: "bg-purple-100 text-purple-700",
  weekly: "bg-blue-100 text-blue-700",
  biweekly: "bg-cyan-100 text-cyan-700",
  monthly: "bg-green-100 text-green-700",
  quarterly: "bg-orange-100 text-orange-700",
  biannual: "bg-yellow-100 text-yellow-700",
  annual: "bg-gray-100 text-gray-700",
};

export default function InspectionsSchedulesPage() {
  const [schedules, setSchedules] = useState<InspectionSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inspections/schedules")
      .then((r) => r.json())
      .then((d) => setSchedules(d.schedules || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6" />
          Inspection Schedules
        </h1>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" /> New Schedule
        </Button>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No inspection schedules yet. Create your first recurring inspection.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {schedules.map((s) => (
            <Card key={s._id} className="hover:shadow-md transition">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{s.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description || "No description"}</p>
                  </div>
                  <Badge variant="outline" className={freqColors[s.frequency] || ""}>
                    {s.frequency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {s.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Next: {new Date(s.nextScheduledDate).toLocaleDateString()}
                  </span>
                  {s.lastExecutedDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Last: {new Date(s.lastExecutedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Checklist ({s.checklist?.length || 0} items):
                  </span>
                  {s.checklist?.slice(0, 4).map((c, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {c.task}
                    </Badge>
                  ))}
                  {(s.checklist?.length || 0) > 4 && (
                    <Badge variant="secondary" className="text-[10px]">+{s.checklist.length - 4} more</Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {s.assignedWorkers?.length || 0} workers
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {s.assets?.length || 0} assets
                  </span>
                  {s.ward && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Ward: {s.ward}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
