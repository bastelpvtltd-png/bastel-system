"use client";

import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useMemo, useState } from "react";

const subTabs = [
  { name: "Open User Accounts", path: "/system/open-user-accounts" },
  { name: "Access", path: "/system/access" },
  { name: "Shippers", path: "/system/shippers" },
  { name: "Wharf Details", path: "/system/wharf-details" },
  { name: "Driver Details", path: "/system/driver-details" },
  { name: "Templates", path: "/system/templates" },
  { name: "Billing", path: "/system/billing" },
];

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [username] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("username") || "User" : "User"
  );

  const handleLogout = useMemo(() => () => {
    localStorage.clear();
    router.push("/");
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar username={username} onLogout={handleLogout} />
      <main className="flex-1 flex pt-[70px] pb-[70px]">
        <div className="w-64 bg-blue-950 border-r border-green-900 flex flex-col pt-4 gap-1 px-2">
          {subTabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`text-left px-4 py-2 rounded text-sm transition ${
                pathname === tab.path
                  ? "bg-green-700 text-white font-bold"
                  : "text-green-400 hover:bg-green-900"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
