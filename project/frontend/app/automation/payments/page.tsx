"use client";

import FormCard from "@/components/FormCard";

export default function PaymentsPage() {
  return (
    <FormCard
      fields={["Release No", "Exporter", "Date", "Destination", "Container No", "Seal No"]}
      buttonLabel="Process Export Release"
    />
  );
}