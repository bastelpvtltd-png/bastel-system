export default function SearchPage() {
  return (
    <div className="bg-blue-950 border border-green-900 rounded-lg p-4">
      <input
        type="text"
        placeholder="Search jobs, shipments, invoices..."
        className="w-full p-3 bg-gray-900 border border-green-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
      />
      <p className="text-gray-500 text-xs mt-3">Enter a keyword to search across all records.</p>
    </div>
  );
}