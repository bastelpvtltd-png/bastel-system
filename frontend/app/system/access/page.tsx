"use client";

import { useState } from "react";

interface AccessForm {
  fullName: string;
  mainTab: string;
  subTab: string;
}

const fields: { label: string; key: keyof AccessForm }[] = [
  { label: "Full Name", key: "fullName" },
  { label: "Access main tab", key: "mainTab" },
  { label: "Access sub tab", key: "subTab" },
];

export default function AccessPage() {
  const [formData, setFormData] = useState<AccessForm>({
    fullName: "", mainTab: "", subTab: "",
  });

  return (
    <div>
      <h2 className="text-green-400 text-xl mb-4">Access Control</h2>
      <div className="bg-blue-950 border border-green-900 rounded-lg p-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="text-green-400 text-xs mb-1 block">{field.label}</label>
              <input
                type="text"
                value={formData[field.key]}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                className="w-full p-2 bg-gray-900 border border-green-900 rounded text-white focus:outline-none focus:border-green-400 text-sm"
              />
            </div>
          ))}
        </div>
        <button className="mt-4 bg-green-700 text-white px-6 py-2 rounded hover:bg-green-600 text-sm font-bold transition">
          Update Access
        </button>
      </div>
    </div>
  );
}
