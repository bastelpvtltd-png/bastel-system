"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface AccessForm {
  fullName: string;
  selectedMainTabs: string[];
  selectedSubTabs: string[];
}

interface UserProfile {
  fullName: string;
  designation: string;
  phoneNumber: string;
  email: string;
  username: string;
}

export default function AccessPage() {
  const [users, setUsers] = useState<string[]>([]);
  const [tabsMap, setTabsMap] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<AccessForm>({
    fullName: "", selectedMainTabs: [], selectedSubTabs: [],
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", ok: true });

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3000);
  }

  useEffect(() => {
    fetch(`${API}/api/get-access-data`)
      .then(r => r.json())
      .then(data => {
        setUsers(data.users || []);
        setTabsMap(data.tabs_map || {});
      })
      .catch(console.error);
  }, []);

  // User select -> permissions + profile
  useEffect(() => {
    if (!formData.fullName || !users.includes(formData.fullName)) {
      setUserProfile(null);
      setEditingProfile(false);
      return;
    }
    // Permissions
    fetch(`${API}/api/get-user-permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: formData.fullName }),
    })
      .then(r => r.json())
      .then(data => {
        setFormData(prev => ({
          ...prev,
          selectedMainTabs: data.selectedMainTabs || [],
          selectedSubTabs: data.selectedSubTabs || [],
        }));
      })
      .catch(console.error);

    // Profile details
    fetch(`${API}/api/get-users`)
      .then(r => r.json())
      .then((all: any[]) => {
        const found = all.find(u =>
          String(u["Full Name"] || "").trim() === formData.fullName
        );
        if (found) {
          setUserProfile({
            fullName: String(found["Full Name"] || ""),
            designation: String(found["Designation"] || ""),
            phoneNumber: String(found["Phone Number"] || ""),
            email: String(found["Email"] || ""),
            username: String(found["Username"] || ""),
          });
        }
      })
      .catch(console.error);
  }, [formData.fullName, users]);

  const toggleMainTab = (tab: string) =>
    setFormData(prev => ({
      ...prev,
      selectedMainTabs: prev.selectedMainTabs.includes(tab)
        ? prev.selectedMainTabs.filter(t => t !== tab)
        : [...prev.selectedMainTabs, tab],
    }));

  const toggleSubTab = (sub: string) =>
    setFormData(prev => ({
      ...prev,
      selectedSubTabs: prev.selectedSubTabs.includes(sub)
        ? prev.selectedSubTabs.filter(s => s !== sub)
        : [...prev.selectedSubTabs, sub],
    }));

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/update-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      showToast(data.message, res.ok);
    } catch {
      showToast("Update error!", false);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    if (!userProfile) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userProfile, ...editForm }),
      });
      const data = await res.json();
      if (data.success) {
        setUserProfile(prev => prev ? { ...prev, ...editForm } : prev);
        setEditingProfile(false);
        showToast("Profile updated! ✓", true);
      } else {
        showToast(data.message || "Error!", false);
      }
    } catch {
      showToast("Server error!", false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-green-400 text-xl mb-4 font-bold tracking-tight">ACCESS CONTROL MANAGER</h2>

      <div className="bg-blue-950 border border-green-900 rounded-lg p-6 max-w-4xl shadow-2xl">

        {/* User selector */}
        <div className="mb-6">
          <label className="text-green-500 text-xs mb-2 block uppercase font-bold">Select User</label>
          <input
            list="user-names"
            placeholder="Start typing name..."
            className="w-full p-3 bg-black border border-green-900 rounded text-white focus:outline-none focus:border-green-400 font-mono"
            value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
          />
          <datalist id="user-names">
            {users.map((name, i) => <option key={i} value={name} />)}
          </datalist>
        </div>

        {/* USER DETAIL BOX */}
        {userProfile && (
          <div className="mb-6 bg-gray-900 border border-green-800 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-lg border border-green-500">
                  {userProfile.fullName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{userProfile.fullName}</p>
                  <p className="text-green-400 text-xs">{userProfile.designation || "—"}</p>
                  <p className="text-gray-500 text-xs">@{userProfile.username}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditForm({
                    fullName: userProfile.fullName,
                    designation: userProfile.designation,
                    phoneNumber: userProfile.phoneNumber,
                    email: userProfile.email,
                  });
                  setEditingProfile(!editingProfile);
                }}
                className="text-xs bg-blue-900 border border-blue-700 text-blue-300 px-3 py-1 rounded hover:bg-blue-800 transition"
              >
                {editingProfile ? "Cancel" : "✏ Edit"}
              </button>
            </div>

            {!editingProfile ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-green-500">Phone: </span><span className="text-gray-300">{userProfile.phoneNumber || "—"}</span></div>
                <div><span className="text-green-500">Email: </span><span className="text-gray-300">{userProfile.email || "—"}</span></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-2">
                {(["fullName", "designation", "phoneNumber", "email"] as const).map(key => (
                  <div key={key}>
                    <label className="text-green-500 text-[10px] block mb-1 uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <input
                      value={String(editForm[key] ?? "")}
                      onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                      className="w-full p-2 bg-gray-800 border border-green-800 rounded text-white text-xs focus:outline-none focus:border-green-400"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <button
                    onClick={handleProfileSave}
                    disabled={saving}
                    className="bg-green-700 text-white px-4 py-2 rounded text-xs font-bold hover:bg-green-600 disabled:opacity-50 transition"
                  >
                    {saving ? "SAVING..." : "SAVE PROFILE CHANGES"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Tabs */}
          <div>
            <h3 className="text-green-400 text-sm mb-3 border-b border-green-900 pb-1">Main Navigation Access</h3>
            <div className="bg-gray-900/50 border border-green-900 rounded p-4 h-72 overflow-y-auto">
              {Object.keys(tabsMap).map(main => (
                <label key={main} className="flex items-center space-x-3 mb-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.selectedMainTabs.includes(main)}
                    onChange={() => toggleMainTab(main)}
                    className="w-5 h-5 accent-green-600"
                  />
                  <span className={`text-sm transition ${formData.selectedMainTabs.includes(main) ? 'text-white font-bold' : 'text-gray-500 group-hover:text-gray-300'}`}>
                    {main}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sub Tabs */}
          <div>
            <h3 className="text-green-400 text-sm mb-3 border-b border-green-900 pb-1">Sub Module Access</h3>
            <div className="bg-gray-900/50 border border-green-900 rounded p-4 h-72 overflow-y-auto">
              {formData.selectedMainTabs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-600 text-xs italic">
                  Main Tab එකක් select කරන්න
                </div>
              ) : (
                formData.selectedMainTabs.map(main => (
                  <div key={main} className="mb-6 last:mb-0">
                    <div className="text-green-500 text-[10px] mb-3 uppercase tracking-tighter font-black opacity-80">
                      ▼ {main}
                    </div>
                    <div className="ml-4 space-y-3">
                      {tabsMap[main]?.map(sub => (
                        <label key={sub} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.selectedSubTabs.includes(sub)}
                            onChange={() => toggleSubTab(sub)}
                            className="w-4 h-4 accent-green-400"
                          />
                          <span className={`text-xs transition ${formData.selectedSubTabs.includes(sub) ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                            {sub}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Save access */}
        <div className="pt-6 border-t border-green-900 mt-6">
          <button
            onClick={handleUpdate}
            disabled={loading || !formData.fullName}
            className="w-full bg-green-700 text-white py-4 rounded font-black tracking-widest hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-600 transition"
          >
            {loading ? "PROCESSING..." : "COMMIT CHANGES TO DATABASE"}
          </button>
          {formData.fullName && (
            <p className="text-[10px] text-gray-500 mt-3 text-center italic">
              Changes will be applied to <span className="text-green-600 font-bold">{formData.fullName}</span>
            </p>
          )}
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
