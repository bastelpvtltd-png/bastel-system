"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import FormCard from "@/components/FormCard";

const tabs = [
  { name: "Boat Note Pass" },
  { name: "Export Release" },
  { name: "Payments" },
];

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState("Boat Note Pass");

  return (
    <PageLayout title="Automation" tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab}>
      {activeTab === "Boat Note Pass" && (
        <FormCard
          fields={["Boat Note No", "Vessel", "Date", "Port", "Agent", "Status"]}
          buttonLabel="Process Boat Note Pass"
        />
      )}
      {activeTab === "Export Release" && (
        <FormCard
          fields={["Release No", "Exporter", "Date", "Destination", "Container No", "Seal No"]}
          buttonLabel="Process Export Release"
        />
      )}
      {activeTab === "Payments" && (
        <FormCard
          fields={["Payment Ref", "Amount", "Currency", "Payment Date", "Method", "Reference"]}
          buttonLabel="Process Payment"
        />
      )}
    </PageLayout>
  );
}
