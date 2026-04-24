"use client";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tabs, setTabs] = useState<{ name: string; href: string }[]>([]);

  // GitHub එකේදී security සහ Deployment වලදී පහසු වීමට Environment Variable එක භාවිතා කරයි
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchSettingsTabs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/nav-config`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // SETTINGS කියන MAIN ටැබ් එකට අදාළ SUB ටැබ් ටික වෙන් කර ගැනීම
        const settingsConfig = data.find(
          (item: any) => item.label.toUpperCase() === "SETTINGS"
        );

        if (settingsConfig && Array.isArray(settingsConfig.subs)) {
          const formattedTabs = settingsConfig.subs.map((sub: string) => {
            // URL එක safe විදිහට format කිරීම (lowercase + dashes)
            const folderFriendlyName = sub.toLowerCase().trim().replace(/\s+/g, "-");
            return {
              name: sub,
              href: `/settings/${folderFriendlyName}`
            };
          });
          setTabs(formattedTabs);
        }
      } catch (err) {
        console.error("Settings tabs load error:", err);
      }
    };

    fetchSettingsTabs();
  }, [API_BASE_URL]);

  // URL එකට ගැලපෙන ටැබ් එක highlight කිරීම
  const activeTab = tabs.find(
    (t) => t.href.toLowerCase() === pathname.toLowerCase()
  );
  
  const activeTabName = activeTab ? activeTab.name : (tabs[0]?.name || "Profile");

  return (
    <PageLayout
      title="Settings"
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