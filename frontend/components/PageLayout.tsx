"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/useAuth";

interface Tab {
  name: string;
  path?: string;
}

interface PageLayoutProps {
  title: string;
  tabs: Tab[];
  activeTab: string;
  onTabClick: (tab: string) => void;
  children: React.ReactNode;
}

export default function PageLayout({ title, tabs, activeTab, onTabClick, children }: PageLayoutProps) {
  const { username, handleLogout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar username={username} onLogout={handleLogout} />
      <main className="flex-1 flex pt-[70px] pb-[70px]">
        {/* Sidebar */}
        <div className="w-48 bg-blue-950 border-r border-green-900 flex flex-col pt-4 gap-1 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => onTabClick(tab.name)}
              className={`text-left px-4 py-2 rounded text-sm transition ${
                activeTab === tab.name
                  ? "bg-green-700 text-white font-bold"
                  : "text-green-400 hover:bg-green-900"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-green-400 text-xl font-bold tracking-wide">
              {title} — {activeTab}
            </h2>
            <div className="w-24 h-px bg-green-700 mt-2" />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
