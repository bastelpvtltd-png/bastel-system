"use client";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

export default function JobLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tabs, setTabs] = useState<{ name: string; href: string }[]>([]);

  // GitHub එකට වැදගත්: hardcoded URL එක වෙනුවට environment variable එකක් ගන්නවා
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchJobTabs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/nav-config`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // JOB කියන MAIN ටැබ් එකට අදාළ SUB ටැබ් ටික වෙන් කර ගැනීම
        const jobConfig = data.find(
          (item: any) => item.label.toUpperCase() === "JOB"
        );

        if (jobConfig && Array.isArray(jobConfig.subs)) {
          const formattedTabs = jobConfig.subs.map((sub: string) => {
            // URL එක safe විදිහට format කරනවා (lowercase + trim + dashes)
            const folderFriendlyName = sub.toLowerCase().trim().replace(/\s+/g, "-");
            return {
              name: sub,
              href: `/job/${folderFriendlyName}`
            };
          });
          setTabs(formattedTabs);
        }
      } catch (err) {
        console.error("Job tabs load error:", err);
      }
    };

    fetchJobTabs();
  }, [API_BASE_URL]);

  // URL එකට ගැලපෙන ටැබ් එක highlight කිරීම
  const activeTab = tabs.find(
    (t) => t.href.toLowerCase() === pathname.toLowerCase()
  );
  
  const activeTabName = activeTab ? activeTab.name : (tabs[0]?.name || "New Shipment");

  return (
    <PageLayout
      title="Job"
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