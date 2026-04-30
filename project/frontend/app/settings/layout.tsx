"use client";
import { getNavConfig } from "@/lib/navCache";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

// These tabs are ALWAYS available to every logged-in user (own settings)
const ALWAYS_TABS = [
  { name: "Profile",   href: "/settings/profile" },
  { name: "Security",  href: "/settings/security" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const CACHE_KEY = "tabs_cache_settings";
  const [tabs, setTabs] = useState<{ name: string; href: string }[]>(ALWAYS_TABS);

  useEffect(() => {
    // Load cached first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) setTabs(parsed);
      }
    } catch {}

    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const allowedSubTabs: string[] = JSON.parse(localStorage.getItem("subTabs") || "[]");

    getNavConfig().then(data => {
        if (!Array.isArray(data)) return;
        const config = data.find((item: any) => item.label.toUpperCase() === "SETTINGS");

        // Extra tabs from nav-config (admin or permitted)
        let extraSubs: string[] = [];
        if (config) {
          extraSubs = isAdmin
            ? config.subs
            : config.subs.filter((s: string) =>
                allowedSubTabs.some((a: string) => a.toLowerCase() === s.toLowerCase())
              );
        }

        // Merge: always tabs + extra (deduplicate by href)
        const extraFormatted = extraSubs
          .map((sub: string) => ({
            name: sub,
            href: `/settings/${sub.toLowerCase().trim().replace(/\s+/g, "-")}`,
          }))
          .filter(t => !ALWAYS_TABS.some(a => a.href === t.href));

        const merged = [...ALWAYS_TABS, ...extraFormatted];
        localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
        setTabs(merged);
      })
      .catch(() => {}); // Keep ALWAYS_TABS on error
  }, []);

  const activeTab = tabs.find(t => t.href.toLowerCase() === pathname.toLowerCase());

  return (
    <PageLayout
      title="Settings"
      tabs={tabs}
      activeTab={activeTab?.name || "Profile"}
      onTabClick={(name: string) => {
        const t = tabs.find(x => x.name === name);
        if (t) router.push(t.href);
      }}
    >
      {children}
    </PageLayout>
  );
}
