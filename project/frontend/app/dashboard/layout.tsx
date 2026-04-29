"use client";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const CACHE_KEY = "tabs_cache_dashboard";

  const [tabs, setTabs] = useState<{ name: string; href: string }[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const allowedSubTabs: string[] = JSON.parse(localStorage.getItem("subTabs") || "[]");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nav-config`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.warn("nav-config error - using cached tabs:", data?.error || data);
          return;
        }

        const config = data.find((item: any) => item.label.toUpperCase() === "DASHBOARD");
        if (!config) return;

        const allSubs: string[] = config.subs;
        const filteredSubs = isAdmin
          ? allSubs
          : allSubs.filter((sub) =>
              allowedSubTabs.some((s) => s.toLowerCase() === sub.toLowerCase())
            );

        const formattedTabs = filteredSubs.map((sub: string) => ({
          name: sub,
          href: `/dashboard/${sub.toLowerCase().trim().replace(/\s+/g, "-")}`,
        }));

        localStorage.setItem(CACHE_KEY, JSON.stringify(formattedTabs));
        setTabs(formattedTabs);
      })
      .catch((err) => {
        console.warn("Dashboard tabs fetch failed - keeping cached tabs:", err);
      });
  }, []);

  const activeTab = tabs.find((t) => t.href.toLowerCase() === pathname.toLowerCase());
  const activeTabName = activeTab ? activeTab.name : (tabs[0]?.name || "Summary");

  return (
    <PageLayout
      title="Dashboard"
      tabs={tabs}
      activeTab={activeTabName}
      onTabClick={(name: string) => {
        const target = tabs.find((t) => t.name === name);
        if (target) router.push(target.href);
      }}
    >
      {children}
    </PageLayout>
  );
}
