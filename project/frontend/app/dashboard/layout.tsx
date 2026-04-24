"use client";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

const tabs = [
  { name: "Summary", href: "/dashboard/summery" }, // Folder name eka summery nisa
  { name: "My Work", href: "/dashboard/My-work" },
  { name: "All Works", href: "/dashboard/All-works" },
  { name: "Search", href: "/dashboard/search" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // URL eka anuwa active tab eka hoyaganna
  const activeTabName = tabs.find(tab => tab.href === pathname)?.name || "Summary";

  return (
    <PageLayout 
      title="Dashboard" 
      tabs={tabs.map(t => ({ name: t.name }))} 
      activeTab={activeTabName} 
      onTabClick={(name) => {
        const target = tabs.find(t => t.name === name);
        if (target) router.push(target.href);
      }}
    >
      {children}
    </PageLayout>
  );
}