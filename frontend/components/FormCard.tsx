"use client";

interface FormField {
  label: string;
  key: string;
  type?: string;
  placeholder?: string;
}

interface FormCardProps {
  fields: FormField[] | string[];
  buttonLabel: string;
  description?: string;
  onSubmit?: () => void;
}

export default function FormCard({ fields, buttonLabel, description, onSubmit }: FormCardProps) {
  const normalizedFields: FormField[] = fields.map((f) =>
    typeof f === "string" ? { label: f, key: f, type: "text", placeholder: f } : f
  );

  return (
    <div className="bg-blue-950 border border-green-900 rounded-lg p-6 max-w-2xl">
      {description && <p className="text-gray-400 text-sm mb-4">{description}</p>}
      <div className="grid grid-cols-2 gap-4">
        {normalizedFields.map((field) => (
          <div key={field.key}>
            <label className="text-green-400 text-xs mb-1 block">{field.label}</label>
            <input
              type={field.type || "text"}
              placeholder={field.placeholder || field.label}
              className="w-full p-2 bg-gray-900 border border-green-900 rounded text-white placeholder-gray-600 focus:outline-none focus:border-green-400 text-sm"
            />
          </div>
        ))}
      </div>
      <button
        onClick={onSubmit}
        className="mt-4 bg-green-700 text-white px-6 py-2 rounded hover:bg-green-600 text-sm font-bold transition"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
