"use client";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

const tabs = [
  { name: "Profile", href: "/settings/Profile" },
  { name: "Security", href: "/settings/Security" },
  { name: "System Info", href: "/settings/System-Info" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTabName = tabs.find(tab => tab.href === pathname)?.name || "Profile";

  return (
    <PageLayout 
      title="Settings" 
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