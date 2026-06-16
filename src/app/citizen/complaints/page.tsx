"use client";

import { useState, useEffect } from "react";
import { citizenAPI } from "@/lib/api-client";

export default function CitizenComplaintsPage() {
  const [complaints, setComplaints] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    citizenAPI.getComplaints()
      .then((res: unknown) => setComplaints((res as { complaints: Array<Record<string, unknown>> }).complaints || []))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Complaints</h1>
      <div className="bg-white rounded-lg shadow">
        {complaints.map((c) => (
          <div key={c._id as string} className="p-4 border-b last:border-b-0 flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{c.title as string}</p>
              <p className="text-xs text-gray-500">
                {c.trackingNumber as string} &middot; {c.category as string} &middot; {c.department as string}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              c.status === "resolved" ? "bg-green-100 text-green-700" :
              c.status === "pending" ? "bg-yellow-100 text-yellow-700" :
              "bg-blue-100 text-blue-700"
            }`}>{c.status as string}</span>
          </div>
        ))}
        {complaints.length === 0 && (
          <p className="p-6 text-center text-gray-400">No complaints yet.</p>
        )}
      </div>
    </div>
  );
}
