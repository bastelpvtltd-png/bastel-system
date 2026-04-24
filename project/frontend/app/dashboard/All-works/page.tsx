const jobRows = [
  { id: "J001", type: "Shipment", status: "Completed", date: "2025-04-20" },
  { id: "J002", type: "Invoice", status: "Pending", date: "2025-04-21" },
  { id: "J003", type: "Cusdec", status: "In Progress", date: "2025-04-22" },
];

const statusColor: Record<string, string> = {
  Completed: "bg-green-900 text-green-400",
  Pending: "bg-yellow-900 text-yellow-400",
  "In Progress": "bg-blue-900 text-blue-400",
};

export default function AllWorksPage() {
  return (
    <div className="bg-blue-950 border border-green-900 rounded-lg p-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-green-400 border-b border-green-900">
            {["Job ID", "Type", "Status", "Date"].map((h) => (
              <th key={h} className="text-left py-2 px-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-300">
          {jobRows.map((row) => (
            <tr key={row.id} className="border-b border-blue-900 hover:bg-blue-900/30">
              <td className="py-2 px-3">{row.id}</td>
              <td className="py-2 px-3">{row.type}</td>
              <td className="py-2 px-3">
                <span className={`px-2 py-0.5 rounded text-xs ${statusColor[row.status]}`}>
                  {row.status}
                </span>
              </td>
              <td className="py-2 px-3">{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}