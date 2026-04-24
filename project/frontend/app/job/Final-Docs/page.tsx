import FormCard from "@/components/FormCard";

export default function CusdecPage() {
  return (
    <FormCard
      fields={["Reference No", "Date", "Description", "Status"]}
      buttonLabel="Save Final Docs"
      description="Final Docs module — ready for data entry."
    />
  );
}