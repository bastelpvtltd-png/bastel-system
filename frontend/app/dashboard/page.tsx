"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";

const tabs = [
  { name: "Summary" },
  { name: "My Work" },
  { name: "All Works" },
  { name: "Search" },
];

const summaryCards = [
  { label: "Total Jobs", value: "128", color: "border-green-700" },
  { label: "Pending", value: "24", color: "border-yellow-600" },
  { label: "Completed", value: "98", color: "border-blue-600" },
  { label: "Alerts", value: "6", color: "border-red-600" },
];

const jobRows = [
  { id: "J001", type: "Shipment", status: "Completed", date: "2025-04-20" },
  { id: "J002", type: "Invoice", status: "Pending", date: "2025-04-21" },
  { id: "J003", type: "Cusdec", status: "In Progress", date: "2025-04-22" },
];

const statusColor: Record<string, string> = {
  Completed: "bg-green-900 text-green-400",
  Pending: "bg-yellow-900 text-yellow-400",
  "In Progress": "bg-blue-900 text-blue-400",
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Summary");

  return (
    <PageLayout title="Dashboard" tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab}>
      {activeTab === "Summary" && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className={`bg-blue-950 border ${card.color} rounded-lg p-4`}>
              <p className="text-gray-400 text-xs mb-1">{card.label}</p>
              <p className="text-white text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "My Work" && (
        <div className="bg-blue-950 border border-green-900 rounded-lg p-4">
          <p className="text-gray-400 text-sm">No tasks assigned yet.</p>
        </div>
      )}

      {activeTab === "All Works" && (
        <div className="bg-blue-950 border border-green-900 rounded-lg p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-green-400 border-b border-green-900">
                {["Job ID", "Type", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {jobRows.map((row) => (
                <tr key={row.id} className="border-b border-blue-900 hover:bg-blue-900/30">
                  <td className="py-2 px-3">{row.id}</td>
                  <td className="py-2 px-3">{row.type}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColor[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2 px-3">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Search" && (
        <div className="bg-blue-950 border border-green-900 rounded-lg p-4">
          <input
            type="text"
            placeholder="Search jobs, shipments, invoices..."
            className="w-full p-3 bg-gray-900 border border-green-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
          />
          <p className="text-gray-500 text-xs mt-3">Enter a keyword to search across all records.</p>
        </div>
      )}
    </PageLayout>
  );
}