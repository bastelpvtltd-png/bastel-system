import FormCard from "@/components/FormCard";

export default function BoatNotePassPage() {
  return (
    <FormCard
      fields={["Boat Note No", "Vessel", "Date", "Port", "Agent", "Status"]}
      buttonLabel="Process Boat Note Pass"
    />
  );
}