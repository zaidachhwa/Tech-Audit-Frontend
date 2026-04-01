import { useState } from "react";
import BatchSelector from "./BatchSelector";
import StudentSelector from "./StudentSelector";
import ParameterSection from "./ParameterSection";


export default function AssignTask() {
  const [batchName, setBatchName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [date, setDate] = useState("");
  const [student, setStudent] = useState("");

  const [parameters, setParameters] = useState([
    { name: "", score: "" },
  ]);

  const handleAssign = async () => {
  try {
    const payload = {
      batchName,
      batchNumber,
      student, // optional if individual
      parameters,
      date,
    };

    console.log("SENDING:", payload);

    await API.post("/assignments/create", payload);

    alert("Assignment Assigned ✅");
  } catch (err) {
    console.error(err);
    alert("Failed ❌");
  }
};

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">
        Assign Project
      </h1>

      <BatchSelector
        batchName={batchName}
        setBatchName={setBatchName}
        batchNumber={batchNumber}
        setBatchNumber={setBatchNumber}
        date={date}
        setDate={setDate}
      />

      <StudentSelector
        student={student}
        setStudent={setStudent}
      />

      <ParameterSection
        parameters={parameters}
        setParameters={setParameters}
      />
      <button
        onClick={handleAssign}
        className="bg-green-600 text-white px-4 py-2 rounded-lg mt-4"
      >
        Assign Task
      </button>
    </div>


  );
}