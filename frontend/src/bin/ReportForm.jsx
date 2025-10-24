import { useState } from "react";
import { supabase } from "../services/supabase";
import { Link } from "react-router-dom";

export default function ReportForm({
  student,
  onChange,
  onDateChange,
  onFileUpload,
  onSkillChange,
  onAddSkill,
  onFeedbackChange,
  onDownload,
}) {
  const [loading, setLoading] = useState(false);
  // ✅ Save student and create NEW report each time
  const saveStudentAndReport = async () => {
    setLoading(true);
    if (!student.firstname || !student.lastname) {
      alert("Please enter student name");
      return;
    }
    if (!student.email) {
      alert("Email is required to identify the student.");
      return;
    }

    const name = `${student.firstname} ${student.lastname}`.trim();

    try {
      // 1️⃣ Check or create student
      const { data: existingStudent } = await supabase
        .from("students")
        .select("id")
        .eq("email", student.email)
        .maybeSingle();

      let studentId;

      if (existingStudent) {
        studentId = existingStudent.id;
        await supabase
          .from("students")
          .update({
            name,
            phone: student.phone || null,
            batch: student.batch || null,
            updated_at: new Date(),
          })
          .eq("id", studentId);
      } else {
        const { data: newStudent, error: insertError } = await supabase
          .from("students")
          .insert([
            {
              name,
              email: student.email,
              phone: student.phone || null,
              batch: student.batch || null,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        studentId = newStudent.id;
      }

      // 2️⃣ Insert new report (always new record)
      const skillMap = {};
      student.skills.forEach((s) => {
        if (s.key) skillMap[s.key] = s.value;
      });

      const reportData = {
        student_id: studentId,
        batch: student.batch,
        audit_date: student.dateRaw || new Date().toISOString().split("T")[0],
        feedback_1: student.feedbackLines[0] || null,
        feedback_2: student.feedbackLines[1] || null,
        feedback_3: student.feedbackLines[2] || null,
        html: skillMap.html || null,
        css: skillMap.css || null,
        js: skillMap.js || null,
        react: skillMap.react || null,
        next_js: skillMap.next_js || null,
        devops: skillMap.devops || null,
        created_at: new Date().toISOString(),
      };

      const { error: reportError } = await supabase
        .from("reports")
        .insert([reportData]);

      if (reportError) throw reportError;

      alert("✅ Student and new report saved successfully!");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mt-8">
      <h2 className="text-2xl font-semibold text-center text-sky-700 mb-6">
        Student Evaluation Form
      </h2>

      {/* Basic Info */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
          Personal Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            value={student.firstname}
            onChange={(e) => onChange("firstname", e.target.value)}
            placeholder="Enter first name"
          />
          <InputField
            label="Last Name"
            value={student.lastname}
            onChange={(e) => onChange("lastname", e.target.value)}
            placeholder="Enter last name"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Email"
            value={student.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="Enter student email"
          />
          <InputField
            label="Phone"
            value={student.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </section>

      {/* Batch & Date */}
      <section className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
          Session Details
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Batch"
            value={student.batch}
            onChange={(e) => onChange("batch", e.target.value)}
            placeholder="e.g., 2"
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={student.dateRaw || ""}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 rounded-lg p-2 outline-none transition"
            />
            {student.date && (
              <p className="text-xs text-slate-500 mt-1">
                Selected: {student.date}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Logo Upload */}
      <section className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
          Branding
        </h3>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-200 p-3 rounded-lg">
          <label className="font-medium text-slate-700">Upload Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileUpload("logo", e.target.files?.[0])}
            className="text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
          />
        </div>
      </section>

      {/* Skills Section */}
      <section className="space-y-4 mt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-700">
            Skills Evaluation (0–10)
          </h3>
          <button
            onClick={onAddSkill}
            className="text-sm px-3 py-1.5 bg-sky-600 text-white rounded-md hover:bg-sky-700"
          >
            + Add Skill
          </button>
        </div>

        <div className="space-y-3">
          {student.skills.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 border border-slate-200 rounded-lg p-3 bg-slate-50"
            >
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={(e) =>
                  onSkillChange(idx, "enabled", e.target.checked)
                }
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 rounded"
              />
              <input
                type="text"
                value={s.label}
                onChange={(e) => onSkillChange(idx, "label", e.target.value)}
                className="flex-1 border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Skill name"
              />
              <input
                type="number"
                min="0"
                max="10"
                value={s.value}
                onChange={(e) => onSkillChange(idx, "value", e.target.value)}
                disabled={!s.enabled}
                className="w-20 text-center border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100"
                placeholder="__/10"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Feedback Section */}
      <section className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">
          Feedback
        </h3>
        <div className="space-y-2">
          {student.feedbackLines.map((f, i) => (
            <input
              key={i}
              value={f}
              onChange={(e) => onFeedbackChange(i, e.target.value)}
              className="w-full border border-slate-300 p-2 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder={`Feedback ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-3 mt-8">
        <button
          onClick={saveStudentAndReport}
          className="flex-1 bg-sky-600 cursor-pointer hover:bg-sky-700 text-white py-2.5 rounded-lg font-medium"
        >
          {loading ? "Saving" : "Save Student & New Report"}
        </button>
        <button
          onClick={onDownload}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium"
        >
          Download PDF
        </button>
      </div>

      <Link
        to="/student-dashboard"
        className="w-full flex items-center justify-center mt-6 underline cursor-pointer text-indigo-400"
      >
        Go to Student's Dashboard
      </Link>
    </div>
  );
}

/* Reusable Input Component */
const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 rounded-lg p-2 outline-none transition"
    />
  </div>
);
