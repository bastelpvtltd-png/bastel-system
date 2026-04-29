"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/useAuth";
import { useRouter, usePathname } from "next/navigation";

interface Tab {
  name: string;
}

interface PageLayoutProps {
  title: string;
  tabs: Tab[];
  activeTab: string;
  // TypeScript error එක විසඳීමට මෙය අනිවාර්යයෙන්ම තිබිය යුතුයි
  onTabClick: (name: string) => void; 
  children: React.ReactNode;
}

export default function PageLayout({ title, tabs, activeTab, onTabClick, children }: PageLayoutProps) {
  const { username, handleLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {/* Navbar එකට User තොරතුරු ලබා දෙයි */}
      <Navbar username={username} onLogout={handleLogout} />

      <main className="flex-1 flex pt-[70px] pb-[70px]">
        {/* SIDEBAR: Excel එකේ SUB column එකේ තියෙන ටැබ් ටික මෙතන පෙන්වයි */}
        <div className="w-48 bg-blue-950 border-r border-green-900 flex flex-col pt-4 gap-1 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              // මෙතනදී Layout එකෙන් ලැබෙන onTabClick function එක ක්‍රියාත්මක කරයි
              onClick={() => onTabClick(tab.name)} 
              className={`text-left px-4 py-2 rounded text-sm transition ${
                // දැනට ඉන්න පේජ් එකේ නම Excel එකේ නමට සමානදැයි බලයි
                activeTab.toLowerCase() === tab.name.toLowerCase()
                  ? "bg-green-700 text-white font-bold border border-green-500"
                  : "text-green-400 hover:bg-green-900"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* CONTENT: තෝරාගත් පේජ් එකට අදාළ Content එක */}
        <div className="flex-1 p-6">
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