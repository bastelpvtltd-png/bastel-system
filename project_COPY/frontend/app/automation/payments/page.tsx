"use client";

import FormCard from "@/components/FormCard";

export default function PaymentsPage() {
  return (
    <FormCard
      fields={["Payment Ref", "Amount", "Currency", "Payment Date", "Method", "Reference"]}
      buttonLabel="Process Payment"
    />
  );
}