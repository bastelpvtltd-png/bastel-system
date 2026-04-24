import FormCard from "@/components/FormCard";

export default function InvoiceCreatePage() {
  return (
    <FormCard
      fields={["Invoice No", "Date", "Customer", "Amount", "Currency", "Reference"]}
      buttonLabel="Create Invoice"
    />
  );
}