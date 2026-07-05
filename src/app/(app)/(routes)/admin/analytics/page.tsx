"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DepartmentPerformance {
  _id: string;
  total: number;
  resolved: number;
}

interface Distribution {
  _id: string;
  count: number;
}

interface MonthlyTrend {
  _id: { year: number; month: number };
  total: number;
  resolved: number;
}

interface AnalyticsData {
  departmentPerformance: DepartmentPerformance[];
  priorityDistribution: Distribution[];
  statusDistribution: Distribution[];
  monthlyTrends: MonthlyTrend[];
}

// ---------------------------------------------------------------------------
// Colour maps
// ---------------------------------------------------------------------------

const PRIORITY_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#6b7280",
  "in-progress": "#3b82f6",
  resolved: "#22c55e",
  rejected: "#ef4444",
};

const FALLBACK_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f97316",
  "#eab308",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f43f5e",
];

// ---------------------------------------------------------------------------
// Pie-chart custom label
// ---------------------------------------------------------------------------

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx,
  cy,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: PieLabelRenderProps) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // don't show tiny slices

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ---------------------------------------------------------------------------
// Chart axis helpers
// ---------------------------------------------------------------------------

const AXIS_TICK_STYLE = { fill: "#6b7280", fontSize: 12 };
const GRID_STROKE = "#e5e7eb";

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <Skeleton className="h-9 w-52" />
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-80 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getAnalytics("6months")
      .then((res) => setData(res as AnalyticsData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const deptPerf = data?.departmentPerformance ?? [];
  const priorityDist = data?.priorityDistribution ?? [];
  const statusDist = data?.statusDistribution ?? [];
  const monthlyTrends = data?.monthlyTrends ?? [];

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const monthlyData = monthlyTrends.map((m) => ({
    name: `${monthNames[m._id.month - 1]} ${m._id.year}`,
    total: m.total,
    resolved: m.resolved,
  }));

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of complaint trends and department performance
        </p>
      </div>

      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* Charts tab                                                        */}
        {/* ================================================================ */}
        <TabsContent value="charts" className="mt-6 space-y-6">
          {/* ---- Monthly Trends ------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                    <XAxis dataKey="name" tick={AXIS_TICK_STYLE} />
                    <YAxis tick={AXIS_TICK_STYLE} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="total"
                      fill="#3b82f6"
                      name="Total"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="resolved"
                      fill="#22c55e"
                      name="Resolved"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ---- Department Performance (horizontal bars) ----------------- */}
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[max(20rem,calc(var(--count,1)*3rem))] min-h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deptPerf}
                    layout="vertical"
                    margin={{ top: 5, right: 20, bottom: 5, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                    <XAxis type="number" tick={AXIS_TICK_STYLE} allowDecimals={false} />
                    <YAxis
                      dataKey="_id"
                      type="category"
                      tick={AXIS_TICK_STYLE}
                      width={130}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="total"
                      fill="#3b82f6"
                      name="Total"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="resolved"
                      fill="#22c55e"
                      name="Resolved"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ---- Priority + Status side-by-side -------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityDist}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel as any}
                        outerRadius={100}
                        dataKey="count"
                        nameKey="_id"
                      >
                        {priorityDist.map((entry, index) => (
                          <Cell
                            key={`priority-${index}`}
                            fill={
                              PRIORITY_COLORS[entry._id] ??
                              FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDist}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel as any}
                        outerRadius={100}
                        dataKey="count"
                        nameKey="_id"
                      >
                        {statusDist.map((entry, index) => (
                          <Cell
                            key={`status-${index}`}
                            fill={
                              STATUS_COLORS[entry._id] ??
                              FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* Map View tab (placeholder)                                       */}
        {/* ================================================================ */}
        <TabsContent value="map" className="mt-6">
          <Card>
            <CardContent className="flex items-center justify-center py-24">
              <p className="text-muted-foreground text-lg">
                Map view coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
