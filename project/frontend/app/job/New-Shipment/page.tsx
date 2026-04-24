import FormCard from "@/components/FormCard";

export default function NewShipmentPage() {
  return (
    <FormCard
      fields={["Shipper", "Consignee", "Port of Loading", "Port of Discharge", "Vessel", "Voyage No"]}
      buttonLabel="Create Shipment"
    />
  );
}