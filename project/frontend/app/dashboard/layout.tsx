"use client";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tabs, setTabs] = useState<{ name: string; href: string }[]>([]);

  // 1. GitHub දාද්දී URL එක hide කරන්න Environment Variable එකක් පාවිච්චි කරනවා
  // Local එකේදී http://localhost:5000 ගන්නවා, හැබැයි GitHub/Deployment වලදී ඒ අදාළ URL එක ගන්නවා
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchDashboardTabs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/nav-config`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // Dashboard කියන MAIN ටැබ් එකට අදාළ SUB ටැබ් ටික වෙන් කර ගැනීම
        const dashboardConfig = data.find(
          (item: any) => item.label.toUpperCase() === "DASHBOARD"
        );

        if (dashboardConfig && Array.isArray(dashboardConfig.subs)) {
          const formattedTabs = dashboardConfig.subs.map((sub: string) => {
            // URL එක safe විදිහට format කරනවා
            const folderFriendlyName = sub.toLowerCase().trim().replace(/\s+/g, "-");
            return {
              name: sub,
              href: `/dashboard/${folderFriendlyName}`
            };
          });
          setTabs(formattedTabs);
        }
      } catch (err) {
        console.error("Dashboard tabs load error:", err);
      }
    };

    fetchDashboardTabs();
  }, [API_BASE_URL]);

  // URL එකට ගැලපෙන ටැබ් එක highlight කිරීම
  const activeTab = tabs.find(
    (t) => t.href.toLowerCase() === pathname.toLowerCase()
  );
  
  const activeTabName = activeTab ? activeTab.name : (tabs[0]?.name || "Summary");

  return (
    <PageLayout
      title="Dashboard"
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