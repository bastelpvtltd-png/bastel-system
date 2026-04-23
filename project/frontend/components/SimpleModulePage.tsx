"use client";

import FormCard from "@/components/FormCard";

const commonFields = ["Name", "Reference", "Contact", "Status"];

interface SimpleModulePageProps {
  title: string;
}

export default function SimpleModulePage({ title }: SimpleModulePageProps) {
  return (
    <div>
      <h2 className="text-green-400 text-xl mb-4">{title}</h2>
      <FormCard
        fields={commonFields}
        buttonLabel={`Save ${title}`}
        description={`${title} module — ready for data entry.`}
      />
    </div>
  );
}
