"use client";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

const tabs = [
  { name: "Boat Note Pass", href: "/automation/Boat-Note-Pass" },
  { name: "Export Release", href: "/automation/Export-Release" },
  { name: "Payments", href: "/automation/Payments" },
];

export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTabName = tabs.find(tab => tab.href === pathname)?.name || "Boat Note Pass";

  return (
    <PageLayout 
      title="Automation" 
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