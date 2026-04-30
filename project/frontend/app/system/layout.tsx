"use client";
import { getNavConfig } from "@/lib/navCache";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const CACHE_KEY = "tabs_cache_system";

  // SSR safe: empty init, load from cache in useEffect
  const [tabs, setTabs] = useState<{ name: string; href: string }[]>([]);

  useEffect(() => {
    // 1. Instant load from cache (no flicker)
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) setTabs(parsed);
      }
    } catch {}

    // 2. Background fetch to update cache
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const allowedSubTabs: string[] = JSON.parse(localStorage.getItem("subTabs") || "[]");

    getNavConfig().then(data => {
        if (!Array.isArray(data)) return;
        const config = data.find((item: any) => item.label.toUpperCase() === "SYSTEM");
        if (!config) return;
        const subs: string[] = isAdmin
          ? config.subs
          : config.subs.filter((s: string) =>
              allowedSubTabs.some((a: string) => a.toLowerCase() === s.toLowerCase())
            );
        const formatted = subs.map((sub: string) => ({
          name: sub,
          href: `/system/${sub.toLowerCase().trim().replace(/\s+/g, "-")}`,
        }));
        localStorage.setItem(CACHE_KEY, JSON.stringify(formatted));
        setTabs(formatted);
      })
      .catch(() => {}); // Keep cache on error
  }, []);

  const activeTab = tabs.find(t => t.href.toLowerCase() === pathname.toLowerCase());

  return (
    <PageLayout
      title="System"
      tabs={tabs}
      activeTab={activeTab?.name || tabs[0]?.name || ""}
      onTabClick={(name: string) => {
        const t = tabs.find(x => x.name === name);
        if (t) router.push(t.href);
      }}
    >
      {children}
    </PageLayout>
  );
}
