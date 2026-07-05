"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ClipboardCheck, Calendar, MapPin, CheckCircle2, AlertTriangle, Clock, Play,
} from "lucide-react";

interface InspectionSchedule {
  _id: string;
  title: string;
  category: string;
  frequency: string;
  checklist: Array<{ task: string; required: boolean }>;
  assets: Array<{ _id: string; name: string }>;
  ward?: string;
  nextScheduledDate: string;
}

export default function WorkerInspectionsPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<InspectionSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inspections/schedules")
      .then((r) => r.json())
      .then((d) => setSchedules(d.schedules || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const startInspection = async (schedule: InspectionSchedule) => {
    try {
      // Get current location (or use default)
      const location = {
        address: schedule.ward ? `Ward ${schedule.ward}` : "Field Inspection",
      };

      const res = await fetch("/api/inspections/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: schedule._id,
          location,
          checklist: schedule.checklist.map((c) => ({
            task: c.task,
            completed: false,
          })),
          status: "in-progress",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Inspection started!");
        router.push(`/inspections/results/${data._id}`);
      } else {
        toast.error("Failed to start inspection");
      }
    } catch {
      toast.error("Failed to start inspection");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <ClipboardCheck className="w-6 h-6" />
        My Inspections
      </h1>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No inspection schedules assigned to you</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {schedules.map((s) => (
            <Card key={s._id} className="hover:shadow-md transition">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{s.title}</CardTitle>
                  <Badge variant="outline" className="text-xs capitalize">{s.frequency}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Next: {new Date(s.nextScheduledDate).toLocaleDateString()}
                  </span>
                  {s.ward && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Ward {s.ward}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Checklist:</span>
                  {s.checklist?.slice(0, 3).map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        {c.required && <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                      </div>
                      <span className="text-gray-600">{c.task}</span>
                      {c.required && <Badge variant="outline" className="text-[10px] px-1">Required</Badge>}
                    </div>
                  ))}
                  {(s.checklist?.length || 0) > 3 && (
                    <p className="text-xs text-muted-foreground pl-6">+{s.checklist.length - 3} more items</p>
                  )}
                </div>

                <Button size="sm" className="w-full mt-2" onClick={() => startInspection(s)}>
                  <Play className="w-4 h-4 mr-1" /> Start Inspection
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
