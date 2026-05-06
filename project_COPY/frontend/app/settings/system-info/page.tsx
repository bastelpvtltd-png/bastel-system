"use client";
import { useAuth } from "@/lib/useAuth";

const systemInfo = [
  { label: "System", value: "BASTEL Security Monitoring" },
  { label: "Version", value: "1.2.0" },
  { label: "Frontend", value: "Next.js + TypeScript + Tailwind" },
  { label: "Backend", value: "FastAPI (Python)" },
  { label: "Database", value: "PostgreSQL" },
];

export default function SystemInfoPage() {
  const { username } = useAuth();

  return (
    <div className="bg-blue-950 border border-green-900 rounded-lg p-6 max-w-2xl">
      {[...systemInfo, { label: "Logged in as", value: username }].map((item) => (
        <div key={item.label} className="flex justify-between py-2 border-b border-blue-900">
          <span className="text-green-400 text-sm">{item.label}</span>
          <span className="text-gray-300 text-sm">{item.value}</span>
        </div>
      ))}
    </div>
  );
}