"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ClipboardCheck, Camera, MapPin, Calendar, CheckCircle2,
  AlertTriangle, Loader2, ArrowLeft, FileText,
} from "lucide-react";

export default function InspectionResultDetailPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const router = useRouter();
  const [result, setResult] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/inspections/results?`)
      .then((r) => r.json())
      .then((d) => {
        const found = (d.results || []).find((r: Record<string, unknown>) => r._id === resultId);
        setResult(found || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [resultId]);

  const checklist = (result.checklist as Array<Record<string, unknown>>) || [];
  const schedule = result.scheduleId as Record<string, unknown> | undefined;

  const toggleChecklistItem = (index: number) => {
    const updated = [...checklist];
    updated[index] = { ...updated[index], completed: !updated[index].completed };
    setResult({ ...result, checklist: updated });
  };

  const setFinding = (index: number, finding: string) => {
    const updated = [...checklist];
    updated[index] = { ...updated[index], finding };
    setResult({ ...result, checklist: updated });
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const issuesFound = checklist.filter(
        (c) => c.finding === "issue_found" || c.finding === "needs_attention"
      ).length;

      const res = await fetch("/api/inspections/results", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resultId,
          checklist,
          status: "completed",
          issuesFound,
          overallCondition: issuesFound > 0 ? "fair" : "good",
          notes: result.notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Inspection completed!");
        if (data.complaintCreated) {
          toast.success("Issues found — complaint auto-created");
        }
        router.push("/worker/inspections");
      } else {
        toast.error("Failed to complete inspection");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/worker/inspections")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6" />
          {schedule?.title as string || "Inspection"}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {(result.location as Record<string, unknown>)?.address as string || "—"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(result.startedAt as string).toLocaleString()}
          </span>
          <Badge variant="outline" className="text-xs capitalize">
            {result.status as string}
          </Badge>
        </div>
      </div>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inspection Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <button
                onClick={() => toggleChecklistItem(i)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                  item.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {Boolean(item.completed) && <CheckCircle2 className="w-3 h-3" />}
              </button>
              <div className="flex-1 min-w-0 space-y-2">
                <p className={`text-sm ${item.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                  {item.task as string}
                </p>
                {Boolean(item.completed) && (
                  <div className="flex gap-2">
                    {(["ok", "issue_found", "needs_attention"] as const).map((f) => (
                      <Badge
                        key={f}
                        variant="outline"
                        className={`cursor-pointer text-[10px] ${
                          item.finding === f
                            ? f === "ok" ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-red-100 text-red-700 border-red-300"
                            : ""
                        }`}
                        onClick={() => setFinding(i, f)}
                      >
                        {f === "ok" ? "✅ OK" : f === "issue_found" ? "⚠️ Issue" : "🔴 Needs Attention"}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any additional observations..."
            value={(result.notes as string) || ""}
            onChange={(e) => setResult({ ...result, notes: e.target.value })}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Complete Button */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleComplete}
        disabled={saving || checklist.length === 0}
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
        ) : (
          <><CheckCircle2 className="w-4 h-4 mr-2" /> Complete Inspection</>
        )}
      </Button>

      {Boolean(result.complaintCreated) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800">Issues Found</p>
              <p className="text-xs text-orange-600">
                A complaint has been automatically created for the issues found during this inspection.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
