"use client";

import { useState, useEffect } from "react";
import { complaintsAPI } from "@/lib/api-client";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintsAPI.getAll()
      .then((res: unknown) => setComplaints((res as { complaints: Array<Record<string, unknown>> }).complaints || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await complaintsAPI.update(id, { status });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status } : c))
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading complaints...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Complaints</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-left">Tracking #</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id as string} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{c.trackingNumber as string}</td>
                <td className="p-3">{c.title as string}</td>
                <td className="p-3">{c.category as string}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    c.status === "resolved" ? "bg-green-100 text-green-700" :
                    c.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{c.status as string}</span>
                </td>
                <td className="p-3">{c.priority as string}</td>
                <td className="p-3">
                  <select
                    value={c.status as string}
                    onChange={(e) => handleStatusChange(c._id as string, e.target.value)}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
