"use client";

const summaryCards = [
  { label: "Total Jobs", value: "128", color: "border-green-700" },
  { label: "Pending", value: "24", color: "border-yellow-600" },
  { label: "Completed", value: "98", color: "border-blue-600" },
  { label: "Alerts", value: "6", color: "border-red-600" },
];

export default function SummaryPage() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {summaryCards.map((card) => (
        <div key={card.label} className={`bg-blue-950 border ${card.color} rounded-lg p-4`}>
          <p className="text-gray-400 text-xs mb-1">{card.label}</p>
          <p className="text-white text-2xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}