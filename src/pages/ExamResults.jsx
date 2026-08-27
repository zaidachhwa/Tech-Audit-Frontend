import React, { useEffect, useState } from "react";
import { API } from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { Award, ChevronDown, ChevronRight, Save, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const S = {
  label: { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#475569" },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 14, outline: "none", transition: "border 0.2s" },
  btnSave: { padding: "10px 20px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }
};

export default function ExamResults() {
  const [batches, setBatches] = useState([]);
  const [filterBatch, setFilterBatch] = useState("");
  
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/batches/public")
      .then((res) => {
        setBatches(res.data || []);
        if (res.data && res.data.length > 0) {
          setFilterBatch(res.data[0]._id);
        }
      })
      .catch(() => toast.error("Failed to load batches"));
  }, []);

  useEffect(() => {
    if (filterBatch) fetchResultsData(filterBatch);
  }, [filterBatch]);

  const fetchResultsData = async (batchId) => {
    try {
      setLoading(true);
      const res = await API.get(`/exam-results/batch/${batchId}`);
      setExams(res.data.exams || []);
      setStudents(res.data.students || []);
      setResults(res.data.results || []);
    } catch (err) {
      toast.error("Failed to load results data");
    } finally {
      setLoading(false);
    }
  };

  const getResultForStudentAndExam = (studentId, examId) => {
    return results.find(r => r.student === studentId && r.exam === examId);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2 sm:p-6 pb-24">
      <Toaster position="top-right" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Award size={18} />
        </div>
        <div>
          <h1 className="font-bold text-xl text-slate-800">Exam Results</h1>
          <p className="text-sm text-slate-500">Record and edit student exam scores</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
        <label style={S.label}>Select Batch</label>
        <select 
          style={S.input} 
          value={filterBatch} 
          onChange={(e) => setFilterBatch(e.target.value)}
        >
          <option value="">-- Select a Batch --</option>
          {batches.map(b => (
            <option key={b._id} value={b._id}>{b.batch_name} - {b.batch_no}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">Loading data...</div>
      ) : students.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No students found in this batch.</div>
      ) : exams.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No exams scheduled for this batch yet.</div>
      ) : (
        <div className="space-y-4">
          {students.map(student => (
            <StudentAccordion 
              key={student._id} 
              student={student} 
              exams={exams} 
              getResultForStudentAndExam={getResultForStudentAndExam} 
              onSaveSuccess={() => fetchResultsData(filterBatch)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentAccordion({ student, exams, getResultForStudentAndExam, onSaveSuccess }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            {(student.name || "S").charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-800">{student.name}</div>
            <div className="text-xs text-slate-500">{student.email}</div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-slate-100">
            <div className="p-4 bg-slate-50 space-y-4">
              {exams.map(exam => (
                <ExamResultForm 
                  key={exam._id} 
                  exam={exam} 
                  student={student} 
                  existingResult={getResultForStudentAndExam(student._id, exam._id)} 
                  onSaveSuccess={onSaveSuccess}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExamResultForm({ exam, student, existingResult, onSaveSuccess }) {
  const [form, setForm] = useState({
    marksObtained: existingResult?.marksObtained || "",
    totalMarks: existingResult?.totalMarks || 100,
    remarks: existingResult?.remarks || ""
  });
  
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const calculateGradeAndStatus = (obtained, total) => {
    const percentage = (obtained / total) * 100;
    let grade = "F";
    let status = "Fail";
    
    if (percentage >= 90) { grade = "A+"; status = "Pass"; }
    else if (percentage >= 80) { grade = "A"; status = "Pass"; }
    else if (percentage >= 70) { grade = "B"; status = "Pass"; }
    else if (percentage >= 60) { grade = "C"; status = "Pass"; }
    else if (percentage >= 50) { grade = "D"; status = "Pass"; }
    else if (percentage >= 40) { grade = "E"; status = "Pass"; }
    
    return { grade, status };
  };

  const handleSave = async () => {
    if (form.marksObtained === "" || form.totalMarks === "") {
      toast.error("Marks are required");
      return;
    }
    
    const obtained = Number(form.marksObtained);
    const total = Number(form.totalMarks);
    
    if (obtained > total) {
      toast.error("Marks obtained cannot be greater than total marks");
      return;
    }
    
    const { grade, status } = calculateGradeAndStatus(obtained, total);

    try {
      setSaving(true);
      
      let gradedPaperData = existingResult?.gradedPaper || null;
      if (file) {
        toast.loading("Uploading paper...", { id: "uploadResult" });
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await API.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        gradedPaperData = {
          fileName: uploadRes.data.originalName || file.name,
          fileUrl: uploadRes.data.fileUrl
        };
        toast.dismiss("uploadResult");
      }
      
      const payload = {
        examId: exam._id,
        studentId: student._id,
        marksObtained: obtained,
        totalMarks: total,
        grade,
        status,
        remarks: form.remarks,
        gradedPaper: gradedPaperData
      };
      
      await API.post("/exam-results", payload);
      toast.success("Result saved!");
      onSaveSuccess();
    } catch (err) {
      toast.dismiss("uploadResult");
      toast.error(err.response?.data?.message || "Failed to save result");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200">
      <div className="font-bold text-sm text-slate-800 mb-3 pb-2 border-b border-slate-100 flex justify-between items-center">
        <span>{exam.subject} - {new Date(exam.date).toLocaleDateString()}</span>
        {existingResult && (
          <span className={`px-2 py-1 rounded text-xs ${existingResult.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {existingResult.grade} ({existingResult.status})
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label style={S.label}>Marks Obtained</label>
          <input 
            type="number" 
            style={S.input} 
            value={form.marksObtained} 
            onChange={(e) => setForm({ ...form, marksObtained: e.target.value })} 
          />
        </div>
        <div>
          <label style={S.label}>Total Marks</label>
          <input 
            type="number" 
            style={S.input} 
            value={form.totalMarks} 
            onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} 
          />
        </div>
        <div className="sm:col-span-2">
          <label style={S.label}>Remarks (Optional)</label>
          <input 
            type="text" 
            style={S.input} 
            value={form.remarks} 
            placeholder="Good performance..."
            onChange={(e) => setForm({ ...form, remarks: e.target.value })} 
          />
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label style={{ padding: "6px 12px", background: "#F1F5F9", color: "#475569", border: "1.5px solid #CBD5E1", borderRadius: 6, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
            <Upload size={14} /> {file ? file.name : existingResult?.gradedPaper ? "Update Graded PDF" : "Upload Graded PDF"}
            <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
          </label>
          {existingResult?.gradedPaper?.fileUrl && !file && (
            <a href={existingResult.gradedPaper.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-xs font-semibold hover:underline">
              View Current Paper
            </a>
          )}
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {saving ? "Saving..." : "Save Result"}
        </button>
      </div>
    </div>
  );
}
