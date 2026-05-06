"use client";

import { useState } from "react";

interface UserForm {
  fullName: string;
  designation: string;
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
}

const fields: { label: string; key: keyof UserForm; type: string }[] = [
  { label: "Full Name", key: "fullName", type: "text" },
  { label: "Designation", key: "designation", type: "text" },
  { label: "Phone Number", key: "phoneNumber", type: "text" },
  { label: "Email", key: "email", type: "email" },
  { label: "Username", key: "username", type: "text" },
  { label: "Password", key: "password", type: "password" },
];

const emptyForm: UserForm = {
  fullName: "", designation: "", phoneNumber: "",
  email: "", username: "", password: "",
};

export default function OpenUserAccounts() {
  const [formData, setFormData] = useState<UserForm>(emptyForm);

  async function handleSubmit() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/add-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    alert(data.message);
  }

  return (
    <div>
      <h2 className="text-green-400 text-xl mb-4">Open User Accounts</h2>
      <div className="bg-blue-950 border border-green-900 rounded-lg p-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="text-green-400 text-xs mb-1 block">{field.label}</label>
              <input
                type={field.type}
                value={formData[field.key]}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                className="w-full p-2 bg-gray-900 border border-green-900 rounded text-white focus:outline-none focus:border-green-400 text-sm"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 bg-green-700 text-white px-6 py-2 rounded hover:bg-green-600 text-sm font-bold transition"
        >
          Save User
        </button>
      </div>
    </div>
  );
}
