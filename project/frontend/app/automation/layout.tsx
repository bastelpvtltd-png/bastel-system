"use client";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tabs, setTabs] = useState<{ name: string; href: string }[]>([]);

  // GitHub දාද්දී API URL එක ආරක්ෂිතව තබා ගැනීමට Environment Variable එක භාවිතා කිරීම
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchAutomationTabs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/nav-config`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // AUTOMATION කියන MAIN ටැබ් එකට අදාළ දත්ත සොයා ගැනීම
        const config = data.find(
          (item: any) => item.label.toUpperCase() === "AUTOMATION"
        );

        if (config && Array.isArray(config.subs)) {
          const formattedTabs = config.subs.map((sub: string) => {
            // URL එක safe විදිහට format කරනවා (lowercase + spaces වලට dashes)
            const folderFriendlyName = sub.toLowerCase().trim().replace(/\s+/g, "-");
            return {
              name: sub,
              href: `/automation/${folderFriendlyName}`
            };
          });
          setTabs(formattedTabs);
        }
      } catch (err) {
        console.error("Automation tabs load error:", err);
      }
    };

    fetchAutomationTabs();
  }, [API_BASE_URL]);

  // දැනට ඇති Path එක අනුව Active Tab එක හඳුනා ගැනීම
  const activeTab = tabs.find(
    (t) => t.href.toLowerCase() === pathname.toLowerCase()
  );
  
  const activeTabName = activeTab ? activeTab.name : (tabs[0]?.name || "");

  return (
    <PageLayout
      title="Automation"
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