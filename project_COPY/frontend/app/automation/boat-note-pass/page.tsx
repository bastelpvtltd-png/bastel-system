"use client";

import FormCard from "@/components/FormCard";

export default function CusdecPage() {
  return (
    <FormCard
      fields={["Reference No", "Date", "Description", "Status"]}
      buttonLabel="Save BARCOD"
      description="BARCODE module — ready for data entry."
    />
  );
}