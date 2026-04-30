"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

type ProfileData = {
  fullName: string;
  designation: string;
  phoneNumber: string;
  email: string;
  username: string;
};

type FieldDef = {
  key: keyof ProfileData;
  label: string;
  editable: boolean;
};

const FIELDS: FieldDef[] = [
  { key: "fullName",    label: "Full Name",    editable: true  },
  { key: "designation", label: "Designation",  editable: true  },
  { key: "phoneNumber", label: "Phone Number", editable: true  },
  { key: "email",       label: "Email",        editable: true  },
  { key: "username",    label: "Username",     editable: false },
];

const EMPTY: ProfileData = { fullName: "", designation: "", phoneNumber: "", email: "", username: "" };

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(EMPTY);
  const [form,    setForm]    = useState<ProfileData>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState({ msg: "", ok: true });

  useEffect(() => {
    const u = localStorage.getItem("username") || "";
    if (!u) { setLoading(false); return; }

    fetch(`${API}/api/profile/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const p: ProfileData = {
            fullName:    d.fullName    || "",
            designation: d.designation || "",
            phoneNumber: d.phoneNumber || "",
            email:       d.email       || "",
            username:    d.username    || u,
          };
          setProfile(p);
          setForm(p);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`${API}/api/profile/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setProfile(form);
      setEditing(false);
      localStorage.setItem("fullName", form.fullName);
      showToast("Profile updated! ✓", true);
    } else {
      showToast(data.message || "Error!", false);
    }
  }

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3000);
  }

  if (loading) return (
    <div className="p-4 text-green-400 text-sm animate-pulse">Loading profile...</div>
  );

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-green-700 flex items-center justify-center text-white text-2xl font-bold border-2 border-green-500">
          {profile.fullName?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{profile.fullName || "—"}</h3>
          <p className="text-green-400 text-sm">{profile.designation || "—"}</p>
          <p className="text-gray-500 text-xs">@{profile.username}</p>
        </div>
      </div>

      <div className="bg-blue-950 border border-green-900 rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 mb-6">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="text-green-400 text-xs mb-1 block uppercase tracking-wider">{f.label}</label>
              {editing && f.editable ? (
                <input
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full p-2 bg-gray-900 border border-green-700 rounded text-white text-sm focus:outline-none focus:border-green-400"
                />
              ) : (
                <div className="w-full p-2 bg-gray-900/50 border border-green-950 rounded text-white text-sm">
                  {profile[f.key] || <span className="text-gray-600">—</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex-1 bg-green-700 text-white py-2 rounded font-bold text-sm hover:bg-green-600 transition">
              ✏ EDIT PROFILE
            </button>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-green-700 text-white py-2 rounded font-bold text-sm hover:bg-green-600 transition disabled:opacity-50">
                {saving ? "SAVING..." : "SAVE CHANGES"}
              </button>
              <button onClick={() => { setEditing(false); setForm(profile); }}
                className="px-4 bg-gray-800 text-gray-300 py-2 rounded text-sm hover:bg-gray-700 transition">
                CANCEL
              </button>
            </>
          )}
          <button onClick={() => router.push("/settings/security")}
            className="px-4 bg-blue-900 text-blue-300 border border-blue-700 py-2 rounded text-sm hover:bg-blue-800 transition">
            🔒 PASSWORD
          </button>
        </div>
      </div>

      {toast.msg && (
        <div className={`fixed bottom-20 right-6 px-4 py-2 rounded shadow-lg text-sm z-50 ${toast.ok ? "bg-green-700" : "bg-red-700"} text-white`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
