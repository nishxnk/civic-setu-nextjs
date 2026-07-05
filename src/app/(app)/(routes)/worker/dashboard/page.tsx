"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList, Clock, CheckCircle2, Loader2,
  MapPin, ExternalLink, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Task {
  _id: string;
  title: string;
  trackingNumber: string;
  status: string;
  priority: string;
  category: string;
  location: { address: string; latitude?: number; longitude?: number };
  citizen: { name: string; phone: string };
  createdAt: string;
}

export default function WorkerDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  const fetchTasks = () => {
    setLoading(true);
    fetch("/api/worker/tasks")
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setStats(data.stats || { pending: 0, inProgress: 0, resolved: 0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/worker/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Task marked as ${status}`);
        fetchTasks();
      }
    } catch (e) {
      toast.error("Failed to update task");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
    );
  }

  const statCards = [
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "In Progress", value: stats.inProgress, icon: Loader2, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <ClipboardList className="w-6 h-6" />
        My Tasks
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {statCards.map((c) => (
          <Card key={c.label}>
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

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        </TabsList>

        {(["all", "pending", "in-progress"] as const).map((tab) => {
          const filtered = tab === "all"
            ? tasks
            : tasks.filter((t) => t.status === tab);

          return (
            <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No tasks found
                  </CardContent>
                </Card>
              ) : (
                filtered.map((task) => (
                  <Card key={task._id} className="hover:shadow-md transition">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{task.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {task.priority === "critical" && <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />}
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-mono">{task.trackingNumber}</span>
                            <span className="mx-2">&middot;</span>
                            <span className="capitalize">{task.category}</span>
                          </p>
                          {task.location?.address && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {task.location.address}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            Citizen: {task.citizen?.name} &middot; {task.citizen?.phone}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {task.status === "pending" && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(task._id, "in-progress")}>
                              Start Work
                            </Button>
                          )}
                          {task.status === "in-progress" && (
                            <Button size="sm" onClick={() => handleStatusUpdate(task._id, "resolved")}>
                              Mark Resolved
                            </Button>
                          )}
                          {task.status === "resolved" && (
                            <Badge variant="outline" className="text-green-700 bg-green-50">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
