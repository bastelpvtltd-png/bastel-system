"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  subs: string[];
}

interface NavbarProps {
  username: string;
  onLogout: () => void;
}

export default function Navbar({ username, onLogout }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [contactTab, setContactTab] = useState<"owner" | "workers">("owner");
  const [showContact, setShowContact] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  // API base URL එක environment variable එකෙන් ගන්නවා
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    setIsMounted(true);

    const fetchNavData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/nav-config`);
        if (!res.ok) throw new Error("Failed to fetch nav data");
        const data = await res.json();
        if (Array.isArray(data)) {
          setNavItems(data);
        }
      } catch (err) {
        console.error("Error loading nav config:", err);
      }
    };

    fetchNavData();
  }, [API_BASE_URL]);

  return (
    <>
      {/* HEADER - z-50 to stay on top */}
      <header className="h-[70px] w-full bg-blue-950 border-b border-green-700 flex items-center justify-between px-6 fixed top-0 left-0 z-50">
        <h1 className="text-green-400 font-bold text-xl tracking-widest">BASTEL PVT LTD</h1>

        <div className="flex items-center gap-2">
          {/* Dynamic Navigation Items */}
          {navItems.length > 0 ? (
            navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={`px-3 py-1 rounded text-sm transition border ${
                  pathname.startsWith(item.href)
                    ? "bg-green-700 text-white border-green-500"
                    : "text-green-400 border-green-800 hover:bg-green-900"
                }`}
              >
                {item.label}
              </button>
            ))
          ) : (
            <span className="text-green-800 text-xs italic">Connecting...</span>
          )}

          <div className="w-px h-6 bg-green-800 mx-1" />

          {/* Quick Actions */}
          {["Mails", "Messages"].map((label) => (
            <button
              key={label}
              onClick={() => setActiveModal(label)}
              className="text-green-400 border border-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-900 transition"
            >
              {label}
            </button>
          ))}

          <button
            onClick={() => setActiveModal("Profile")}
            className="text-green-400 border border-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-900 transition"
          >
            {isMounted ? username : "Loading..."}
          </button>

          <button
            onClick={() => setShowContact(true)}
            className="text-white bg-green-700 border border-green-600 px-3 py-1 rounded text-sm hover:bg-green-600 transition"
          >
            Contact
          </button>

          <button
            onClick={onLogout}
            className="bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* FOOTER */}
      <footer className="h-[70px] w-full bg-blue-950 border-t border-green-700 flex flex-col items-center justify-center fixed bottom-0 left-0 z-40">
        <p className="text-green-500 text-xs tracking-widest uppercase">
          ⚠ High Security System — Unauthorized access strictly prohibited
        </p>
        <p className="text-gray-500 text-xs mt-1">BASTEL PVT LTD — Version 1.2.0</p>
      </footer>

      {/* MODALS */}
      {(activeModal || showContact) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
          {/* General Modal (Mails / Messages / Profile) */}
          {activeModal && (
            <div className="bg-gray-900 border border-green-800 rounded-lg shadow-2xl w-[420px] p-6">
              <div className="flex justify-between items-center mb-4 border-b border-green-900 pb-2">
                <h3 className="text-green-400 font-bold text-lg">{activeModal}</h3>
                <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-red-400 text-xl font-bold transition">✕</button>
              </div>
              <p className="text-gray-400 text-sm">{activeModal} module is under encrypted maintenance.</p>
            </div>
          )}

          {/* Contact Modal */}
          {showContact && (
            <div className="bg-gray-900 border border-green-800 rounded-lg shadow-2xl w-[460px] p-6">
              <div className="flex justify-between items-center mb-4 border-b border-green-900 pb-2">
                <h3 className="text-green-400 font-bold text-lg">Contact Registry</h3>
                <button onClick={() => setShowContact(false)} className="text-gray-500 hover:text-red-400 text-xl font-bold transition">✕</button>
              </div>
              
              <div className="flex gap-2 mb-4">
                {(["owner", "workers"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setContactTab(t)}
                    className={`px-4 py-1 rounded text-xs uppercase tracking-tighter transition ${
                      contactTab === t ? "bg-green-700 text-white" : "text-green-400 border border-green-700 hover:bg-green-900"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="bg-black/30 p-4 rounded border border-green-900/50">
                {contactTab === "owner" ? (
                  <div className="text-gray-300 text-sm space-y-2">
                    <p><span className="text-green-600 font-mono">NAME:</span> Bathiya Kumara</p>
                    <p><span className="text-green-600 font-mono">LINE:</span> +94 77 000 0000</p>
                    <p><span className="text-green-600 font-mono">SECURE:</span> owner@bastel.lk</p>
                  </div>
                ) : (
                  <div className="text-gray-300 text-sm space-y-2">
                    <p><span className="text-green-600 font-mono">UNIT_01:</span> +94 77 111 1111</p>
                    <p><span className="text-green-600 font-mono">UNIT_02:</span> +94 77 222 2222</p>
                    <p><span className="text-green-600 font-mono">UNIT_03:</span> +94 77 333 3333</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}