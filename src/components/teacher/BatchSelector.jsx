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

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await API.get("/batches/public");

        console.log("FULL RESPONSE:", res.data);
        console.log("FIRST BATCH:", res.data[0]);

        setBatches(res.data); // assuming it's an array
      } catch (err) {
        console.error(err);
      }
    };

    fetchBatches();
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl border">
      <h2 className="font-medium mb-4 text-gray-700">
        Batch Information
      </h2>

      <div className="grid grid-cols-2 gap-4">
       {/* Batch Name */}
<select
  value={batchName}
  onChange={(e) => setBatchName(e.target.value)}
  className="border rounded-lg p-2"
>
  <option value="">Select Batch Name</option>

  {[...new Set(batches.map(b => b.batch_name))].map((name) => (
  <option key={name} value={name}>
    {name}
  </option>
))}
</select>

{/* Batch Number */}
<select
  value={batchNumber}
  onChange={(e) => setBatchNumber(e.target.value)}
  className="border rounded-lg p-2"
>
  <option value="">Select Batch Number</option>

  {batches
  .filter((b) => b.batch_name === batchName)
  .map((b) => (
    <option key={b._id} value={b.batch_no}>
      {b.batch_no}
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
    </div>
  );
}