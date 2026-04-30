"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SecurityPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", ok: true });

  async function handleChange() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      showToast("All fields required!", false); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      showToast("New passwords don't match!", false); return;
    }
    if (form.newPassword.length < 4) {
      showToast("Password too short!", false); return;
    }
    setLoading(true);
    const username = localStorage.getItem("username") || "";
    const res = await fetch(`${API}/api/profile/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password changed successfully!", true);
    } else {
      showToast(data.message || "Error!", false);
    }
  }

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3000);
  }

  return (
    <div className="max-w-md">
      <div className="bg-blue-950 border border-green-900 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-2xl">🔒</span>
          <h3 className="text-green-400 font-bold tracking-widest">CHANGE PASSWORD</h3>
        </div>

        <div className="space-y-4 mb-6">
          {[
            { key: "currentPassword", label: "Current Password" },
            { key: "newPassword", label: "New Password" },
            { key: "confirmPassword", label: "Confirm New Password" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-green-400 text-xs mb-1 block uppercase tracking-wider">{f.label}</label>
              <input
                type="password"
                value={(form as any)[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full p-2 bg-gray-900 border border-green-900 rounded text-white text-sm focus:outline-none focus:border-green-400"
              />
            </div>
          ))}
        </div>

        <div className="bg-yellow-900/20 border border-yellow-800 rounded p-3 mb-4">
          <p className="text-yellow-400 text-xs">⚠ After changing your password, you will need to login again.</p>
        </div>

        <button
          onClick={handleChange}
          disabled={loading}
          className="w-full bg-green-700 text-white py-3 rounded font-bold tracking-widest hover:bg-green-600 transition disabled:opacity-50"
        >
          {loading ? "UPDATING..." : "CHANGE PASSWORD"}
        </button>
      </div>

      {toast.msg && (
        <div className={`fixed bottom-20 right-6 px-4 py-2 rounded shadow-lg text-sm z-50 ${toast.ok ? "bg-green-700" : "bg-red-700"} text-white`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
