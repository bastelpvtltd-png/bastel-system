"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/lib/useAuth";

const tabs = [{ name: "Profile" }, { name: "Security" }, { name: "System Info" }];

const systemInfo = [
  { label: "System", value: "BASTEL Security Monitoring" },
  { label: "Version", value: "1.2.0" },
  { label: "Frontend", value: "Next.js + TypeScript + Tailwind" },
  { label: "Backend", value: "FastAPI (Python)" },
  { label: "Database", value: "PostgreSQL" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const { username } = useAuth();

  return (
    <PageLayout title="Settings" tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab}>
      {activeTab === "Profile" && (
        <div className="bg-blue-950 border border-green-900 rounded-lg p-6 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            {["Full Name", "Email", "Phone", "Department"].map((field) => (
              <div key={field}>
                <label className="text-green-400 text-xs mb-1 block">{field}</label>
                <input
                  type="text"
                  placeholder={field}
                  defaultValue={field === "Full Name" ? username : ""}
                  className="w-full p-2 bg-gray-900 border border-green-900 rounded text-white placeholder-gray-600 focus:outline-none focus:border-green-400 text-sm"
                />
              </div>
            ))}
          </div>
          <button className="mt-4 bg-green-700 text-white px-6 py-2 rounded hover:bg-green-600 text-sm font-bold transition">
            Update Profile
          </button>
        </div>
      )}

      {activeTab === "Security" && (
        <div className="bg-blue-950 border border-green-900 rounded-lg p-6 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            {["Current Password", "New Password", "Confirm Password"].map((field) => (
              <div key={field}>
                <label className="text-green-400 text-xs mb-1 block">{field}</label>
                <input
                  type="password"
                  placeholder={field}
                  className="w-full p-2 bg-gray-900 border border-green-900 rounded text-white placeholder-gray-600 focus:outline-none focus:border-green-400 text-sm"
                />
              </div>
            ))}
          </div>
          <button className="mt-4 bg-green-700 text-white px-6 py-2 rounded hover:bg-green-600 text-sm font-bold transition">
            Change Password
          </button>
        </div>
      )}

      {activeTab === "System Info" && (
        <div className="bg-blue-950 border border-green-900 rounded-lg p-6 max-w-2xl">
          {[...systemInfo, { label: "Logged in as", value: username }].map((item) => (
            <div key={item.label} className="flex justify-between py-2 border-b border-blue-900">
              <span className="text-green-400 text-sm">{item.label}</span>
              <span className="text-gray-300 text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
