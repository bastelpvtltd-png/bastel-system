"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import FormCard from "@/components/FormCard";

const tabs = [
  { name: "New Shipment" },
  { name: "Invoice Create" },
  { name: "Cusdec" },
  { name: "CDN" },
  { name: "Barcode" },
  { name: "Boat Note" },
  { name: "Final Docs" },
];

const genericTabs = ["Cusdec", "CDN", "Barcode", "Boat Note", "Final Docs"];

export default function JobPage() {
  const [activeTab, setActiveTab] = useState("New Shipment");

  return (
    <PageLayout title="Job" tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab}>
      {activeTab === "New Shipment" && (
        <FormCard
          fields={["Shipper", "Consignee", "Port of Loading", "Port of Discharge", "Vessel", "Voyage No"]}
          buttonLabel="Create Shipment"
        />
      )}
      {activeTab === "Invoice Create" && (
        <FormCard
          fields={["Invoice No", "Date", "Customer", "Amount", "Currency", "Reference"]}
          buttonLabel="Create Invoice"
        />
      )}
      {genericTabs.includes(activeTab) && (
        <FormCard
          fields={["Reference No", "Date", "Description", "Status"]}
          buttonLabel={`Save ${activeTab}`}
          description={`${activeTab} module — ready for data entry.`}
        />
      )}
    </PageLayout>
  );
}
