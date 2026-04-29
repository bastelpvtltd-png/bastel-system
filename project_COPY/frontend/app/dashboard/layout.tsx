"use client";
import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tabs, setTabs] = useState<{ name: string; href: string }[]>([]);

  useEffect(() => {
    // Backend එකෙන් Excel data ටික ලබා ගැනීම
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nav-config`)
      .then((res) => res.json())
      .then((data) => {
        // Dashboard කියන MAIN ටැබ් එකට අදාළ SUB ටැබ් ටික වෙන් කර ගැනීම
        const dashboardConfig = data.find((item: any) => item.label.toUpperCase() === "DASHBOARD");
        if (dashboardConfig) {
          const formattedTabs = dashboardConfig.subs.map((sub: string) => {
            // URL එක හැමවෙලේම simple letters වලින් සහ space වෙනුවට "-" සහිතව සාදයි
            // එවිට Folder එක 'summery' හෝ 'my-work' ලෙස තිබුණොත් නිවැරදිව Load වේ
            const folderFriendlyName = sub.toLowerCase().trim().replace(/\s+/g, "-");
            return {
              name: sub,
              href: `/dashboard/${folderFriendlyName}`
            };
          });
          setTabs(formattedTabs);
        }
      })
      .catch((err) => console.error("Dashboard tabs load error:", err));
  }, []);

  // URL එකට ගැලපෙන ටැබ් එක highlight කිරීම (Case-insensitive matching)
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