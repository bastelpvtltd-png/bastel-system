"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // SSR safe redirect - useEffect only
    const CACHE_KEY = "tabs_cache_dashboard";
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const tabs = JSON.parse(cached);
        if (tabs.length > 0) { router.replace(tabs[0].href); return; }
      }
    } catch {}

    // No cache - fetch and redirect
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const allowedSubs: string[] = JSON.parse(localStorage.getItem("subTabs") || "[]");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nav-config`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const config = data.find((i: any) => i.label.toLowerCase() === "dashboard");
        if (!config) return;
        const subs: string[] = isAdmin ? config.subs : config.subs.filter((s: string) =>
          allowedSubs.some((a: string) => a.toLowerCase() === s.toLowerCase())
        );
        if (subs.length > 0) {
          router.replace(`/dashboard/${subs[0].toLowerCase().trim().replace(/\s+/g, "-")}`);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-green-400 text-xs tracking-widest animate-pulse">LOADING...</div>
    </div>
  );
}
