"use client"; // මේක Client-side එකේ වැඩ කරන Component එකක් බව Next.js වලට කියයි.

import FormCard from "@/components/FormCard"; // දත්ත ඇතුළත් කරන කොටුව (FormCard) මෙතනට ගෙන්නා ගනී.

// හැම සරල පේජ් එකකටම පොදුවේ පාවිච්චි කරන Input fields ටික මෙතන Define කරලා තියෙනවා.
const commonFields = ["Name", "Reference", "Contact", "Status"];

interface SimpleModulePageProps {
  title: string; // මේ පිටුවට දෙන නම (උදා: Shippers, Drivers වගේ)
}

export default function SimpleModulePage({ title }: SimpleModulePageProps) {
  return (
    <div>
      {/* පිටුවේ මාතෘකාව කොළ පාටින් පෙන්වන තැන */}
      <h2 className="text-green-400 text-xl mb-4">{title}</h2>
      
      {/* අපි කලින් හදාගත්ත FormCard එක මෙතනදී පාවිච්චි කරනවා */}
      <FormCard
        fields={commonFields} // උඩ තියෙන "Name", "Reference" වගේ fields ටික Form එකට ලබා දෙයි.
        buttonLabel={`Save ${title}`} // බටන් එකේ නම dynamic විදිහට හැදෙයි (උදා: Save Shippers).
        description={`${title} module — ready for data entry.`} // Form එකට යටින් පොඩි විස්තරයක් පෙන්වයි.
      />
    </div>
  );
}