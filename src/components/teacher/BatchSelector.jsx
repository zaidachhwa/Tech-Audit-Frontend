import { useEffect, useState } from "react";
import { API } from "../../api/axios";

export default function BatchSelector({
  batchName,
  setBatchName,
  batchNumber,
  setBatchNumber,
  date,
  setDate,
}) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const res = await API.get("/batches/public");

        setBatches(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // ✅ Unique batch names
  const uniqueBatchNames = [
  ...new Set(
    batches.map((b) => b.batch_name.trim().toUpperCase())
  ),
];

  // ✅ Unique batch numbers based on selected name
  const uniqueBatchNumbers = [
  ...new Set(
    batches
      .filter(
        (b) =>
          b.batch_name.trim().toUpperCase() === batchName
      )
      .map((b) => b.batch_no)
  ),
];

  return (
    <div className="bg-white p-4 rounded-xl border">
      <h2 className="font-medium mb-4 text-gray-700">
        Batch Information
      </h2>

      <div className="grid grid-cols-2 gap-4">
        
        {/* Batch Name */}
        <select
  value={batchName}
  onChange={(e) => {
    setBatchName(e.target.value);
    setBatchNumber("");
  }}
  className="border rounded-lg p-2"
>
  <option value="">Select Batch Name</option>

  {uniqueBatchNames.map((name) => (
    <option key={name} value={name}>
      {name}
    </option>
  ))}
</select>

        {/* Batch Number */}
        <select
          value={batchNumber}
          onChange={(e) => setBatchNumber(e.target.value)}
          disabled={!batchName}
          className="border rounded-lg p-2"
        >
          <option value="">Select Batch Number</option>

          {uniqueBatchNumbers.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        {/* Date */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg p-2 col-span-2"
        />
      </div>

      {/* 🔥 Loading + Empty State */}
      {loading && (
        <p className="text-sm text-gray-400 mt-2">Loading batches...</p>
      )}

      {!loading && uniqueBatchNames.length === 0 && (
        <p className="text-sm text-gray-400 mt-2">
          No batches available
        </p>
      )}
    </div>
  );
}