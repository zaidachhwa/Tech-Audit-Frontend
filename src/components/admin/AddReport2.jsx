import React, { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { toast } from "react-hot-toast";

export default function AddReport2() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  const [form, setForm] = useState({
    batch_name: "",
    batch_no: "",
    studentId: "",
    parameters: [{ name: "", score: "" }],
    feedbackSchema: { point1: "", point2: "", point3: "" },
    overallRemarks: "",
    auditDate: "",
  });

  // ================= FETCH =================
  useEffect(() => {
    API.get("/students/list")
      .then((res) => {
        setStudents(res.data?.students || []);
      })
      .catch(() => toast.error("Failed to load students"));

    API.get("/batches/public")
      .then((res) => setBatches(res.data || []))
      .catch(() => toast.error("Failed to load batches"));
  }, []);

  useEffect(() => {
    const filtered = students.filter(
      (s) =>
        s.batch_name === form.batch_name &&
        s.batch_no?.toString() === form.batch_no?.toString()
    );
    setFilteredStudents(filtered);
  }, [form.batch_name, form.batch_no, students]);

  // ================= HELPERS =================
  const getBatchNames = () =>
    [...new Set(batches.map((b) => b.batch_name))];

  const getBatchNos = () =>
    batches
      .filter((b) => b.batch_name === form.batch_name)
      .map((b) => b.batch_no);

  const handleParamChange = (i, field, value) => {
    const updated = [...form.parameters];
    updated[i][field] = value;
    setForm({ ...form, parameters: updated });
  };

  const addParameter = () =>
    setForm({
      ...form,
      parameters: [...form.parameters, { name: "", score: "" }],
    });

  const removeParameter = (i) =>
    setForm({
      ...form,
      parameters: form.parameters.filter((_, index) => index !== i),
    });

  // ================= ACTIONS =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/reports/create", form);
      toast.success("Report saved");
    } catch {
      toast.error("Save failed");
    }
  };

  const handleSaveDraft = async () => {
    try {
      await API.post("/reports/draft", form);
      toast.success("Draft saved");
    } catch {
      toast.error("Draft failed");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await API.post("/reports/create", form);
      const id = res.data?._id;

      const pdf = await API.get(`/reports/${id}/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([pdf.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "report.pdf";
      link.click();
    } catch {
      toast.error("Download failed");
    }
  };

  // ================= UI =================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2B4B]">
          Add Report
        </h1>
        <p className="text-sm text-gray-500">
          Create student audit reports
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">

        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* Batch */}
          <div className="grid grid-cols-3 gap-4">
            <select
              value={form.batch_name}
              onChange={(e) =>
                setForm({ ...form, batch_name: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option>Select Batch</option>
              {getBatchNames().map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>

            <select
              value={form.batch_no}
              onChange={(e) =>
                setForm({ ...form, batch_no: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option>Batch No</option>
              {getBatchNos().map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>

            <input
              type="date"
              value={form.auditDate}
              onChange={(e) =>
                setForm({ ...form, auditDate: e.target.value })
              }
              className="border p-2 rounded"
            />
          </div>

          {/* Student */}
          <select
            value={form.studentId}
            onChange={(e) =>
              setForm({ ...form, studentId: e.target.value })
            }
            className="w-full border p-2 rounded"
          >
            <option>Select Student</option>
            {filteredStudents.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Parameters */}
          <div>
            <div className="flex justify-between mb-2">
              <h2 className="font-semibold">Parameters</h2>
              <button type="button" onClick={addParameter}>
                + Add
              </button>
            </div>

            {form.parameters.map((p, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={p.name}
                  onChange={(e) =>
                    handleParamChange(i, "name", e.target.value)
                  }
                  className="flex-1 border p-2 rounded"
                  placeholder="Name"
                />
                <input
                  value={p.score}
                  onChange={(e) =>
                    handleParamChange(i, "score", e.target.value)
                  }
                  className="w-20 border p-2 rounded"
                  placeholder="Score"
                />
                <button onClick={() => removeParameter(i)}>X</button>
              </div>
            ))}
          </div>

          {/* Feedback */}
          <textarea
            placeholder="Point 1"
            value={form.feedbackSchema.point1}
            onChange={(e) =>
              setForm({
                ...form,
                feedbackSchema: {
                  ...form.feedbackSchema,
                  point1: e.target.value,
                },
              })
            }
            className="w-full border p-2 rounded"
          />

          {/* Remarks */}
          <textarea
            placeholder="Remarks"
            value={form.overallRemarks}
            onChange={(e) =>
              setForm({ ...form, overallRemarks: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Draft
            </button>

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}