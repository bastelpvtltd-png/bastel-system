"use client";

import FormCard from "@/components/FormCard";

export default function PaymentsPage() {
  return (
    <FormCard
      fields={["Releas No", "Exporter", "Date", "Destination", "Container No", "Seal No"]}
      buttonLabel="payment"
    />
  );
}