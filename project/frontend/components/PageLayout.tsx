"use client";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/useAuth";

interface Tab { name: string; }
interface PageLayoutProps {
  title: string;
  tabs: Tab[];
  activeTab: string;
  onTabClick: (name: string) => void;
  children: React.ReactNode;
}

export default function PageLayout({ title, tabs, activeTab, onTabClick, children }: PageLayoutProps) {
  const { username, isAdmin, authChecked, handleLogout } = useAuth();

  if (!authChecked) {
    return (
      <div suppressHydrationWarning className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="text-green-400 text-xs tracking-widest animate-pulse mb-2">LOADING SYSTEM...</div>
          <div className="w-48 h-px bg-green-800 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar username={username} isAdmin={isAdmin} onLogout={handleLogout} />
      <main className="flex-1 flex pt-[70px] pb-[70px]">
        <div className="w-48 bg-blue-950 border-r border-green-900 flex flex-col pt-4 gap-1 px-2">
          {tabs.map(tab => (
            <button key={tab.name} onClick={() => onTabClick(tab.name)}
              className={`text-left px-4 py-2 rounded text-sm transition ${
                activeTab.toLowerCase() === tab.name.toLowerCase()
                  ? "bg-green-700 text-white font-bold border border-green-500"
                  : "text-green-400 hover:bg-green-900"
              }`}>
              {tab.name}
            </button>
          ))}
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="text-green-400 text-xl font-bold tracking-wide uppercase">
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
