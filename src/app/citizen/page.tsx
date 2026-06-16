"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { citizenAPI } from "@/lib/api-client";

export default function CitizenDashboardPage() {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    citizenAPI.getDashboard()
      .then((res: unknown) => setData(res as Record<string, unknown>))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data.stats as Record<string, number> | undefined;
  const recent = (data.recentComplaints as Array<Record<string, unknown>>) || [];

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats?.totalComplaints ?? 0, color: "bg-blue-500" },
          { label: "Resolved", value: stats?.resolvedComplaints ?? 0, color: "bg-green-500" },
          { label: "Pending", value: stats?.pendingComplaints ?? 0, color: "bg-yellow-500" },
          { label: "In Progress", value: stats?.inProgressComplaints ?? 0, color: "bg-purple-500" },
        ].map((c) => (
          <div key={c.label} className={`${c.color} text-white rounded-lg p-4 shadow text-center`}>
            <p className="text-sm opacity-80">{c.label}</p>
            <p className="text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mb-6">
        <Link href="/citizen/report"
          className="bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition">
          Report New Issue
        </Link>
        <Link href="/citizen/complaints"
          className="border border-blue-700 text-blue-700 px-6 py-2 rounded-md hover:bg-blue-50 transition">
          View All Complaints
        </Link>
      </div>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Recent Complaints</h2>
      <div className="bg-white rounded-lg shadow">
        {recent.map((c) => (
          <div key={c._id as string} className="flex justify-between items-center p-4 border-b last:border-b-0">
            <div>
              <p className="font-medium text-gray-800">{c.title as string}</p>
              <p className="text-xs text-gray-500">{c.trackingNumber as string}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              c.status === "resolved" ? "bg-green-100 text-green-700" :
              c.status === "pending" ? "bg-yellow-100 text-yellow-700" :
              "bg-blue-100 text-blue-700"
            }`}>{c.status as string}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
