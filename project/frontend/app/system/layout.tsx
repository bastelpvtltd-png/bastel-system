"use client";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tabs, setTabs] = useState<{ name: string; href: string }[]>([]);

  // GitHub එකට දාද්දී localhost පේන්න නැති වෙන්න Environment Variable එක භාවිතා කිරීම
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchSystemTabs = async () => {
      try {
        // Backend එකෙන් Excel data ටික ලබා ගැනීම
        const res = await fetch(`${API_BASE_URL}/api/nav-config`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // SYSTEM කියන MAIN ටැබ් එකට අදාළ SUB ටැබ් ටික වෙන් කර ගැනීම
        const systemConfig = data.find(
          (item: any) => item.label.toUpperCase() === "SYSTEM"
        );

        if (systemConfig && Array.isArray(systemConfig.subs)) {
          const formattedTabs = systemConfig.subs.map((sub: string) => {
            // URL එක safe විදිහට format කරනවා (lowercase + dashes)
            const folderFriendlyName = sub.toLowerCase().trim().replace(/\s+/g, "-");
            return {
              name: sub,
              href: `/system/${folderFriendlyName}`
            };
          });
          setTabs(formattedTabs);
        }
      } catch (err) {
        console.error("System tabs load error:", err);
      }
    };

    fetchSystemTabs();
  }, [API_BASE_URL]);

  // URL එකට ගැලපෙන ටැබ් එක highlight කිරීම
  const activeTab = tabs.find(
    (t) => t.href.toLowerCase() === pathname.toLowerCase()
  );
  
  const activeTabName = activeTab ? activeTab.name : (tabs[0]?.name || "Open User Accounts");

  return (
    <PageLayout
      title="System"
      tabs={tabs}
      activeTab={activeTabName}
      onTabClick={(name: string) => {
        const target = tabs.find((t) => t.name === name);
        if (target) {
          router.push(target.href);
        }
      }}
    >
      {children}
    </PageLayout>
  );
}