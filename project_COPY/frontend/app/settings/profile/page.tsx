"use client";

import { useAuth } from "@/lib/useAuth";

export default function ProfilePage() {
  const { username } = useAuth();

  return (
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
  );
}