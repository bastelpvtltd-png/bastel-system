"use client";

import { useState, useEffect } from "react";

interface AccessForm {
  fullName: string;
  selectedMainTabs: string[];
  selectedSubTabs: string[];
}

export default function AccessPage() {
  const [users, setUsers] = useState<string[]>([]);
  const [tabsMap, setTabsMap] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<AccessForm>({
    fullName: "", selectedMainTabs: [], selectedSubTabs: [],
  });
  const [loading, setLoading] = useState(false);

  // 1. මුලින්ම Users සහ Tabs structure එක load කිරීම
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-access-data`);
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users || []);
          setTabsMap(data.tabs_map || {});
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
    fetchData();
  }, []);

  // 2. User කෙනෙක්ව select කරපු ගමන් දැනට තියෙන permissions (Ticks) load කිරීම
  useEffect(() => {
    async function loadPermissions() {
      if (!formData.fullName || !users.includes(formData.fullName)) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-user-permissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: formData.fullName }),
        });
        const data = await res.json();
        if (res.ok) {
          setFormData(prev => ({
            ...prev,
            selectedMainTabs: data.selectedMainTabs || [],
            selectedSubTabs: data.selectedSubTabs || [],
          }));
        }
      } catch (err) {
        console.error("Permissions load error:", err);
      }
    }
    loadPermissions();
  }, [formData.fullName, users]);

  const toggleMainTab = (tab: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedMainTabs.includes(tab);
      return {
        ...prev,
        selectedMainTabs: isSelected 
          ? prev.selectedMainTabs.filter(t => t !== tab) 
          : [...prev.selectedMainTabs, tab]
      };
    });
  };

  const toggleSubTab = (sub: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedSubTabs.includes(sub);
      return {
        ...prev,
        selectedSubTabs: isSelected 
          ? prev.selectedSubTabs.filter(s => s !== sub) 
          : [...prev.selectedSubTabs, sub]
      };
    });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Update කිරීම අසාර්ථකයි!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-green-400 text-xl mb-4 font-bold tracking-tight">ACCESS CONTROL MANAGER</h2>
      
      <div className="bg-blue-950 border border-green-900 rounded-lg p-6 max-w-4xl shadow-2xl">
        
        {/* Name Selection */}
        <div className="mb-8">
          <label className="text-green-500 text-xs mb-2 block uppercase font-bold">Select User to Manage Access</label>
          <input 
            list="user-names"
            placeholder="Start typing name..."
            className="w-full p-3 bg-black border border-green-900 rounded text-white focus:outline-none focus:border-green-400 transition-all font-mono"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
          <datalist id="user-names">
            {users.map((name, index) => <option key={index} value={name} />)}
          </datalist>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Tabs Column */}
          <div className="flex flex-col">
            <h3 className="text-green-400 text-sm mb-3 border-b border-green-900 pb-1">Main Navigation Access</h3>
            <div className="bg-gray-900/50 border border-green-900 rounded p-4 h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-green-900">
              {Object.keys(tabsMap).map((main) => (
                <label key={main} className="flex items-center space-x-3 mb-4 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.selectedMainTabs.includes(main)}
                    onChange={() => toggleMainTab(main)}
                    className="w-5 h-5 accent-green-600 rounded bg-black border-green-900"
                  />
                  <span className={`text-sm transition ${formData.selectedMainTabs.includes(main) ? 'text-white font-bold' : 'text-gray-500 group-hover:text-gray-300'}`}>
                    {main}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sub Tabs Column */}
          <div className="flex flex-col">
            <h3 className="text-green-400 text-sm mb-3 border-b border-green-900 pb-1">Sub Module Access</h3>
            <div className="bg-gray-900/50 border border-green-900 rounded p-4 h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-green-900">
              {formData.selectedMainTabs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-600 text-xs italic">
                  Select a Main Tab to configure Sub Tabs
                </div>
              ) : (
                formData.selectedMainTabs.map(main => (
                  <div key={main} className="mb-6 last:mb-0">
                    <div className="text-green-500 text-[10px] mb-3 uppercase tracking-tighter font-black opacity-80 flex items-center">
                      <span className="mr-2">▼</span> {main}
                    </div>
                    <div className="ml-4 space-y-3">
                      {tabsMap[main]?.map(sub => (
                        <label key={sub} className="flex items-center space-x-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={formData.selectedSubTabs.includes(sub)}
                            onChange={() => toggleSubTab(sub)}
                            className="w-4 h-4 accent-green-400 bg-black border-green-900"
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

        {/* Update Action */}
        <div className="mt-8 pt-6 border-t border-green-900">
          <button 
            onClick={handleUpdate}
            disabled={loading || !formData.fullName}
            className="w-full bg-green-700 text-white py-4 rounded-md font-black tracking-widest hover:bg-green-600 active:scale-[0.98] disabled:bg-gray-800 disabled:text-gray-600 transition-all shadow-lg shadow-green-900/20"
          >
            {loading ? "PROCESSING..." : "COMMIT CHANGES TO DATABASE"}
          </button>
          {formData.fullName && (
            <p className="text-[10px] text-gray-500 mt-3 text-center italic">
              Changes will be applied to the profile of <span className="text-green-600 font-bold">{formData.fullName}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}