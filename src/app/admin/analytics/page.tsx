"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api-client";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics("6months")
      .then((res: unknown) => setData(res as Record<string, unknown>))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deptPerf = (data.departmentPerformance as Array<Record<string, unknown>>) || [];
  const priorityDist = (data.priorityDistribution as Array<Record<string, unknown>>) || [];
  const statusDist = (data.statusDistribution as Array<Record<string, unknown>>) || [];

  if (loading) return <div className="p-6 text-gray-500">Loading analytics...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Department Performance</h3>
          {deptPerf.map((d) => (
            <div key={d._id as string} className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>{d._id as string}</span>
                <span className="text-gray-500">Total: {d.total as number} | Resolved: {d.resolved as number}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${((d.resolved as number) / (d.total as number)) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Priority Distribution</h3>
          {priorityDist.map((p) => (
            <div key={p._id as string} className="flex justify-between text-sm py-1 border-b">
              <span className="font-medium">{p._id as string}</span>
              <span>{p.count as number}</span>
            </div>
          ))}
        </div>
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Status Distribution</h3>
          {statusDist.map((s) => (
            <div key={s._id as string} className="flex justify-between text-sm py-1 border-b">
              <span className="font-medium">{s._id as string}</span>
              <span className="font-bold">{s.count as number}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
