"use client";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tabs, setTabs] = useState<{ name: string; href: string }[]>([]);

  useEffect(() => {
    // Backend එකෙන් Excel data ටික ලබා ගැනීම
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/nav-config`)
      .then((res) => res.json())
      .then((data) => {
        // SETTINGS කියන MAIN ටැබ් එකට අදාළ SUB ටැබ් ටික වෙන් කර ගැනීම
        const settingsConfig = data.find((item: any) => item.label.toUpperCase() === "SETTINGS");
        if (settingsConfig) {
          const formattedTabs = settingsConfig.subs.map((sub: string) => {
            // URL එක හැමවෙලේම simple letters වලින් සහ space වෙනුවට "-" සහිතව සාදයි
            // එවිට Folder එක 'profile' හෝ 'system-info' ලෙස තිබුණොත් නිවැරදිව Load වේ
            const folderFriendlyName = sub.toLowerCase().trim().replace(/\s+/g, "-");
            return {
              name: sub,
              href: `/settings/${folderFriendlyName}`
            };
          });
          setTabs(formattedTabs);
        }
      })
      .catch((err) => console.error("Settings tabs load error:", err));
  }, []);

  // URL එකට ගැලපෙන ටැබ් එක highlight කිරීම (Case-insensitive matching)
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
        // ටැබ් එකක් ක්ලික් කළාම අදාළ href එකට navigate කිරීම
        const target = tabs.find((t) => t.name === name);
        if (target) {
          // ක්ලික් කළ විට lowercase කරන ලද URL එකට යොමු කරයි
          router.push(target.href);
        }
      }}
    >
      {children}
    </PageLayout>
  );
}