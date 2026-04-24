"use client";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tabs, setTabs] = useState<{ name: string; href: string }[]>([]);

  useEffect(() => {
    // Backend එකෙන් Excel config දත්ත ලබා ගැනීම
    fetch("http://localhost:5000/api/nav-config")
      .then((res) => res.json())
      .then((data) => {
        // AUTOMATION කියන MAIN ටැබ් එකට අදාළ දත්ත සොයා ගැනීම
        const config = data.find((item: any) => item.label.toUpperCase() === "AUTOMATION");
        if (config) {
          const formattedTabs = config.subs.map((sub: string) => {
            // URL එක හැමවෙලේම simple letters වලින් සහ space වෙනුවට "-" සහිතව සාදයි
            // එවිට Folder එක 'export-release' ලෙස තිබුණොත් නිවැරදිව Load වේ
            const folderFriendlyName = sub.toLowerCase().trim().replace(/\s+/g, "-");
            return {
              name: sub,
              href: `/automation/${folderFriendlyName}`
            };
          });
          setTabs(formattedTabs);
        }
      })
      .catch((err) => console.error("Automation tabs load error:", err));
  }, []);

  // දැනට ඇති Path එක අනුව Active Tab එක හඳුනා ගැනීම (Case-insensitive)
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
          // ක්ලික් කළ විට නිවැරදි lowercase URL එකට යොමු කරයි
          router.push(target.href);
        }
      }}
    >
      {children}
    </PageLayout>
  );
}