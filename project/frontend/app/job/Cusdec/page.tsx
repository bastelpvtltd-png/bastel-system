import FormCard from "@/components/FormCard";

export default function CusdecPage() {
  return (
    <FormCard
      fields={["Reference No", "Date", "Description", "Status"]}
      buttonLabel="Save Cusdec"
      description="Cusdec module — ready for data entry."
    />
  );
}