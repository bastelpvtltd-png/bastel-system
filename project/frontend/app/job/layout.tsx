"use client";
import PageLayout from "@/components/PageLayout";
import { useRouter, usePathname } from "next/navigation";

const tabs = [
  { name: "New Shipment", href: "/job/New-Shipment" },
  { name: "Invoice Create", href: "/job/Invoice-Create" },
  { name: "Cusdec", href: "/job/Cusdec" },
  { name: "CDN", href: "/job/CDN" },
  { name: "Barcode", href: "/job/Barcode" },
  { name: "Boat Note", href: "/job/Boat-Note" },
  { name: "Final Docs", href: "/job/Final-Docs" },
];

export default function JobLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTabName = tabs.find(tab => tab.href === pathname)?.name || "New Shipment";

  return (
    <PageLayout 
      title="Job" 
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