"use client"; // මේක Client-side එකේ වැඩ කරන Component එකක් කියලා Next.js වලට කියනවා.

// Form එකේ එක Input field එකක තියෙන්න ඕන දේවල් මෙතන Define කරනවා (TypeScript interface).
interface FormField {
  label: string;       // Input එකට උඩින් පේන නම (උදා: Name)
  key: string;         // Data හඳුනාගන්න පාවිච්චි කරන Unique නම
  type?: string;        // Input එකේ වර්ගය (text, password, date වගේ)
  placeholder?: string; // Input box එක ඇතුළේ ලා පාටට පේන නම
}

// මේ Component එකට පිටින් ලැබෙන්න ඕන දත්ත (Props) ටික මෙන්න මේවා:
interface FormCardProps {
  fields: FormField[] | string[]; // Input fields ලැයිස්තුව (Objects විදිහට හරි නිකන් Strings විදිහට හරි දිය හැකියි)
  buttonLabel: string;            // බටන් එකේ ලියන්න ඕන නම (උදා: Submit)
  description?: string;           // අවශ්‍ය නම් Form එක ගැන පොඩි විස්තරයක්
  onSubmit?: () => void;          // බටන් එක එබුවම වෙන්න ඕන දේ (Function එකක්)
}

export default function FormCard({ fields, buttonLabel, description, onSubmit }: FormCardProps) {
  
  // මේකෙන් කරන්නේ ඔයා Strings විදිහට දුන්නොත් (උදා: ["Name", "Email"]), 
  // ඒ ටික TypeScript එකට තේරෙන FormField Objects බවට පත් කරන එකයි.
  const normalizedFields: FormField[] = fields.map((f) =>
    typeof f === "string" ? { label: f, key: f, type: "text", placeholder: f } : f
  );

  return (
    // මුළු Form එකම දවටලා තියෙන නිල් පාට පෙට්ටිය (Main Container)
    <div className="bg-blue-950 border border-green-900 rounded-lg p-6 max-w-2xl">
      
      {/* විස්තරයක් (Description) තිබුණොත් විතරක් ඒක මෙතන පෙන්වනවා */}
      {description && <p className="text-gray-400 text-sm mb-4">{description}</p>}
      
      {/* Input fields ටික පේළියට දෙක ගානේ (Grid) සකස් කරනවා */}
      <div className="grid grid-cols-2 gap-4">
        {normalizedFields.map((field) => (
          <div key={field.key}>
            {/* Input එකට උඩින් තියෙන පොඩි නම (Label) */}
            <label className="text-green-400 text-xs mb-1 block">{field.label}</label>
            
            {/* දත්ත ඇතුළත් කරන කොටුව (Input Box) */}
            <input
              type={field.type || "text"} // Type එකක් නැත්නම් default 'text' විදිහට ගන්නවා
              placeholder={field.placeholder || field.label} // Placeholder එකක් නැත්නම් label එකම පෙන්නනවා
              className="w-full p-2 bg-gray-900 border border-green-900 rounded text-white placeholder-gray-600 focus:outline-none focus:border-green-400 text-sm"
            />
          </div>
        ))}
      </div>

      {/* Form එක Submit කරන බටන් එක */}
      <button
        onClick={onSubmit} // බටන් එක එබුවම onSubmit function එක වැඩ කරනවා
        className="mt-4 bg-green-700 text-white px-6 py-2 rounded hover:bg-green-600 text-sm font-bold transition"
      >
        {buttonLabel} {/* බටන් එකේ නම පෙන්වන තැන */}
      </button>
    </div>
  );
}