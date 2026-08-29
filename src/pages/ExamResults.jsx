import React, { useEffect, useState } from "react";
import { API } from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { Award, ChevronDown, ChevronRight, Upload, BookOpen, Users, Save, Check, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars

const S = {
  label: { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#475569" },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 14, outline: "none", transition: "border 0.2s" },
  btnSave: { padding: "10px 20px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }
};

export default function ExamResults() {
  const [batches, setBatches] = useState([]);
  const [filterBatch, setFilterBatch] = useState("");
  const [viewMode, setViewMode] = useState("exam"); // "exam" or "student"
  
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
      const offlineOnlyExams = (res.data.exams || []).filter(e => e.examType !== "online");
      setExams(offlineOnlyExams);
      setStudents(res.data.students || []);
      setResults(res.data.results || []);
    } catch (_err) {
      toast.error("Failed to load results data");
    } finally {
      setLoading(false);
    }
  };

  const getResultForStudentAndExam = (studentId, examId) => {
    return results.find(r => String(r.student) === String(studentId) && String(r.exam) === String(examId));
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2 sm:p-6 pb-24">
      <Toaster position="top-right" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Award size={18} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800">Exam Results</h1>
            <p className="text-sm text-slate-500">Record and edit offline exam scores</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode("exam")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === "exam" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen size={14} /> View By Exam
          </button>
          <button
            onClick={() => setViewMode("student")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === "student" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users size={14} /> View By Student
          </button>
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
            <option key={b._id} value={b._id}>{b.batch_name} - #{b.batch_no}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">Loading data...</div>
      ) : exams.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No exams scheduled for this batch yet.</div>
      ) : viewMode === "exam" ? (
        <div className="space-y-4">
          {exams.map(exam => (
            <ExamAccordion 
              key={exam._id} 
              exam={exam} 
              students={students} 
              getResultForStudentAndExam={getResultForStudentAndExam} 
              onSaveSuccess={() => fetchResultsData(filterBatch)}
            />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No students found in this batch.</div>
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

function calculateGradeAndStatus(obtained, total) {
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
}

function ExamAccordion({ exam, students, getResultForStudentAndExam, onSaveSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formsData, setFormsData] = useState({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [globalTotalMarks, setGlobalTotalMarks] = useState("100");
  const [appliedTotalMarks, setAppliedTotalMarks] = useState(null);

  const handleStudentFormChange = (studentId, formState) => {
    setFormsData(prev => ({
      ...prev,
      [studentId]: formState
    }));
  };

  const handleApplyTotalMarks = () => {
    if (!globalTotalMarks || Number(globalTotalMarks) <= 0) {
      toast.error("Please enter a valid total marks value");
      return;
    }
    setAppliedTotalMarks(globalTotalMarks);
    toast.success(`Set total marks to ${globalTotalMarks} for all students`);
  };

  const handleBulkSave = async () => {
    const payloadResults = [];

    for (const student of students) {
      const studentForm = formsData[student._id];
      if (!studentForm || studentForm.marksObtained === "" || studentForm.marksObtained === null || studentForm.marksObtained === undefined) {
        continue;
      }

      const obtained = Number(studentForm.marksObtained);
      const total = Number(studentForm.totalMarks || appliedTotalMarks || 100);

      if (obtained > total) {
        toast.error(`Marks for ${student.name} cannot be greater than total marks`);
        return;
      }

      const { grade, status } = calculateGradeAndStatus(obtained, total);

      let gradedPaperData = studentForm.existingGradedPaper || null;
      if (studentForm.file) {
        try {
          const formData = new FormData();
          formData.append("file", studentForm.file);
          const uploadRes = await API.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          gradedPaperData = {
            fileName: uploadRes.data.originalName || studentForm.file.name,
            fileUrl: uploadRes.data.fileUrl
          };
        } catch (_uploadErr) {
          console.error(_uploadErr);
        }
      }

      payloadResults.push({
        examId: exam._id,
        studentId: student._id,
        marksObtained: obtained,
        totalMarks: total,
        grade,
        status,
        remarks: studentForm.remarks || "",
        gradedPaper: gradedPaperData
      });
    }

    if (payloadResults.length === 0) {
      toast.error("No student marks entered to save");
      return;
    }

    try {
      setBulkSaving(true);
      await API.post("/exam-results/batch-save", { results: payloadResults });
      toast.success(`Saved all marks for ${exam.subject}!`);
      onSaveSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save exam marks");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition flex-wrap gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            <BookOpen size={16} />
          </div>
          <div>
            <div className="font-bold text-slate-800 flex items-center gap-2 flex-wrap">
              {exam.subject}
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                exam.examType === "online" 
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}>
                {exam.examType || "offline"}
              </span>
              {exam.examType === "offline" && exam.questionPaper?.fileUrl && (
                <a 
                  href={exam.questionPaper.fileUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 ml-2"
                >
                  <FileText size={13} /> Question Paper
                </a>
              )}
            </div>
            <div className="text-xs text-slate-500">{new Date(exam.date).toLocaleDateString()}</div>
          </div>
        </div>

        {isOpen && students.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBulkSave();
            }}
            disabled={bulkSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-sm"
          >
            <Save size={14} /> {bulkSaving ? "Saving All..." : `Save All Marks for ${exam.subject}`}
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-slate-100">
            <div className="p-4 bg-slate-50 space-y-4">
              {students.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs font-semibold">
                  No students found in this batch.
                </div>
              ) : (
                <>
                  {/* Set Total Marks for All Banner */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-slate-700">Set Total Marks For All Students:</span>
                      <input 
                        type="number" 
                        value={globalTotalMarks} 
                        onChange={(e) => setGlobalTotalMarks(e.target.value)} 
                        placeholder="100"
                        className="w-24 px-3 py-1 border border-slate-300 rounded-lg text-xs font-bold focus:border-blue-500 outline-none"
                      />
                      <button
                        onClick={handleApplyTotalMarks}
                        className="px-3.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition"
                      >
                        Apply To All Students
                      </button>
                    </div>
                  </div>

                  {students.map(student => (
                    <div key={student._id} className="space-y-1">
                      <div className="text-xs font-bold text-slate-700 px-1">{student.name} ({student.email})</div>
                      <ExamResultForm 
                        exam={exam} 
                        student={student} 
                        existingResult={getResultForStudentAndExam(student._id, exam._id)} 
                        overrideTotalMarks={appliedTotalMarks}
                        onSaveSuccess={onSaveSuccess}
                        onChange={(formState) => handleStudentFormChange(student._id, formState)}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StudentAccordion({ student, exams, getResultForStudentAndExam, onSaveSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formsData, setFormsData] = useState({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [globalTotalMarks, setGlobalTotalMarks] = useState("100");
  const [appliedTotalMarks, setAppliedTotalMarks] = useState(null);

  const handleExamFormChange = (examId, formState) => {
    setFormsData(prev => ({
      ...prev,
      [examId]: formState
    }));
  };

  const handleApplyTotalMarks = () => {
    if (!globalTotalMarks || Number(globalTotalMarks) <= 0) {
      toast.error("Please enter a valid total marks value");
      return;
    }
    setAppliedTotalMarks(globalTotalMarks);
    toast.success(`Set total marks to ${globalTotalMarks} for all exams`);
  };

  const handleBulkSave = async () => {
    const payloadResults = [];

    for (const exam of exams) {
      const examForm = formsData[exam._id];
      if (!examForm || examForm.marksObtained === "" || examForm.marksObtained === null || examForm.marksObtained === undefined) {
        continue;
      }

      const obtained = Number(examForm.marksObtained);
      const total = Number(examForm.totalMarks || appliedTotalMarks || 100);

      if (obtained > total) {
        toast.error(`Marks for ${exam.subject} cannot be greater than total marks`);
        return;
      }

      const { grade, status } = calculateGradeAndStatus(obtained, total);

      let gradedPaperData = examForm.existingGradedPaper || null;
      if (examForm.file) {
        try {
          const formData = new FormData();
          formData.append("file", examForm.file);
          const uploadRes = await API.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          gradedPaperData = {
            fileName: uploadRes.data.originalName || examForm.file.name,
            fileUrl: uploadRes.data.fileUrl
          };
        } catch (_uploadErr) {
          console.error(_uploadErr);
        }
      }

      payloadResults.push({
        examId: exam._id,
        studentId: student._id,
        marksObtained: obtained,
        totalMarks: total,
        grade,
        status,
        remarks: examForm.remarks || "",
        gradedPaper: gradedPaperData
      });
    }

    if (payloadResults.length === 0) {
      toast.error("No exam marks entered to save");
      return;
    }

    try {
      setBulkSaving(true);
      await API.post("/exam-results/batch-save", { results: payloadResults });
      toast.success(`Saved all results for ${student.name}!`);
      onSaveSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save student results");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition flex-wrap gap-2"
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

        {isOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBulkSave();
            }}
            disabled={bulkSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-sm"
          >
            <Save size={14} /> {bulkSaving ? "Saving All..." : `Save All Results for ${student.name}`}
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-slate-100">
            <div className="p-4 bg-slate-50 space-y-4">
              {/* Set Total Marks for All Banner */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-slate-700">Set Total Marks For All Exams:</span>
                  <input 
                    type="number" 
                    value={globalTotalMarks} 
                    onChange={(e) => setGlobalTotalMarks(e.target.value)} 
                    placeholder="100"
                    className="w-24 px-3 py-1 border border-slate-300 rounded-lg text-xs font-bold focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={handleApplyTotalMarks}
                    className="px-3.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition"
                  >
                    Apply To All Exams
                  </button>
                </div>
              </div>

              {exams.map(exam => (
                <ExamResultForm 
                  key={exam._id} 
                  exam={exam} 
                  student={student} 
                  existingResult={getResultForStudentAndExam(student._id, exam._id)} 
                  overrideTotalMarks={appliedTotalMarks}
                  onSaveSuccess={onSaveSuccess}
                  onChange={(formState) => handleExamFormChange(exam._id, formState)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExamResultForm({ exam, student, existingResult, overrideTotalMarks, onSaveSuccess, onChange }) {
  const [form, setForm] = useState({
    marksObtained: existingResult?.marksObtained !== undefined && existingResult?.marksObtained !== null ? existingResult.marksObtained : "",
    totalMarks: existingResult?.totalMarks || 100,
    remarks: existingResult?.remarks || ""
  });
  
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const newForm = {
      marksObtained: existingResult?.marksObtained !== undefined && existingResult?.marksObtained !== null ? existingResult.marksObtained : "",
      totalMarks: existingResult?.totalMarks || 100,
      remarks: existingResult?.remarks || ""
    };
    setForm(newForm);
  }, [existingResult]);

  useEffect(() => {
    if (overrideTotalMarks !== undefined && overrideTotalMarks !== null && overrideTotalMarks !== "") {
      setForm(prev => ({ ...prev, totalMarks: overrideTotalMarks }));
    }
  }, [overrideTotalMarks]);

  useEffect(() => {
    if (onChange) {
      onChange({
        ...form,
        file,
        existingGradedPaper: existingResult?.gradedPaper || null
      });
    }
  }, [form, file, existingResult]);

  const handleSingleSave = async () => {
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
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <div className="font-bold text-sm text-slate-800 mb-3 pb-2 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span>{exam.subject} - {new Date(exam.date).toLocaleDateString()}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
            exam.examType === "online" 
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
              : "bg-amber-100 text-amber-800 border border-amber-200"
          }`}>
            {exam.examType || "offline"}
          </span>
        </div>
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
          onClick={handleSingleSave} 
          disabled={saving}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 disabled:opacity-50 transition flex items-center gap-1.5"
        >
          <Check size={14} /> {saving ? "Saving..." : "Save Row"}
        </button>
      </div>
    </div>
  );
}
