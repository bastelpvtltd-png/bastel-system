"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", subs: ["Summary", "My Work", "All Works", "Search"] },
  { label: "Job", href: "/job", subs: ["New Shipment", "Invoice Create", "Cusdec", "CDN", "Barcode", "Boat Note", "Final Docs"] },
  { label: "System", href: "/system", subs: ["Open Account", "Access", "Shippers", "Wharf Details", "Driver Details", "Templates", "Billing"] },
  { label: "Automation", href: "/automation", subs: ["Boat Note Pass", "Export Release", "Payments"] },
  { label: "Settings", href: "/settings", subs: [] },
];

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

  return (
    <>
      {/* HEADER */}
      <header className="h-[70px] w-full bg-blue-950 border-b border-green-700 flex items-center justify-between px-6 fixed top-0 left-0 z-40">
        <h1 className="text-green-400 font-bold text-xl tracking-widest">BASTEL PVT LTD</h1>

        <div className="flex items-center gap-2">
          {navItems.map((item) => (
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
          ))}

          <div className="w-px h-6 bg-green-800 mx-1" />

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
            {username}
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
        <p className="text-green-500 text-xs tracking-widest">
          ⚠ HIGH SECURITY SYSTEM — Unauthorized access strictly prohibited
        </p>
        <p className="text-gray-500 text-xs mt-1">BASTEL PVT LTD — Version 1.2.0</p>
      </footer>

      {/* MODAL — Mails / Messages / Profile */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-green-800 rounded-lg shadow-xl w-[420px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-green-400 font-bold text-lg">{activeModal}</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-red-400 text-xl font-bold">✕</button>
            </div>
            <p className="text-gray-400 text-sm">{activeModal} module — coming soon.</p>
          </div>
        </div>
      )}

      {/* MODAL — Contact */}
      {showContact && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-green-800 rounded-lg shadow-xl w-[460px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-green-400 font-bold text-lg">Contact</h3>
              <button onClick={() => setShowContact(false)} className="text-gray-500 hover:text-red-400 text-xl font-bold">✕</button>
            </div>
            <div className="flex gap-2 mb-4">
              {(["owner", "workers"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setContactTab(t)}
                  className={`px-4 py-1 rounded text-sm transition capitalize ${
                    contactTab === t ? "bg-green-700 text-white" : "text-green-400 border border-green-700 hover:bg-green-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {contactTab === "owner" ? (
              <div className="text-gray-300 text-sm space-y-2">
                <p><span className="text-green-400">Name:</span> Owner Name</p>
                <p><span className="text-green-400">Phone:</span> +94 77 000 0000</p>
                <p><span className="text-green-400">Email:</span> owner@bastel.lk</p>
              </div>
            ) : (
              <div className="text-gray-300 text-sm space-y-2">
                <p><span className="text-green-400">Worker 1:</span> +94 77 111 1111</p>
                <p><span className="text-green-400">Worker 2:</span> +94 77 222 2222</p>
                <p><span className="text-green-400">Worker 3:</span> +94 77 333 3333</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
