"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api-client";

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
  const cards = stats
    ? [
        { label: "Total", value: stats.totalComplaints, color: "bg-blue-500" },
        { label: "Resolved", value: stats.resolvedComplaints, color: "bg-green-500" },
        { label: "Pending", value: stats.pendingComplaints, color: "bg-yellow-500" },
        { label: "In Progress", value: stats.inProgressComplaints, color: "bg-purple-500" },
        { label: "Users", value: stats.totalUsers ?? 0, color: "bg-indigo-500" },
      ]
    : [];

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`${c.color} text-white rounded-lg p-4 shadow`}>
            <p className="text-sm opacity-80">{c.label}</p>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Complaints</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-left">Tracking #</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Citizen</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Priority</th>
            </tr>
          </thead>
          <tbody>
            {(data.recentComplaints || []).map((c) => (
              <tr key={c._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{c.trackingNumber}</td>
                <td className="p-3">{c.title}</td>
                <td className="p-3">{c.citizen?.name}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    c.status === "resolved" ? "bg-green-100 text-green-700" :
                    c.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{c.status}</span>
                </td>
                <td className="p-3">{c.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
