import React, { useEffect, useState } from "react";
import { API } from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Calendar,
  BookOpen,
  Monitor,
  Building2,
  Trash2,
  FileText,
  Upload,
  Plus,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  HelpCircle,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";

const S = {
  page: { fontFamily: "'DM Sans', sans-serif" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", marginBottom: 2 },
  pageSubtitle: { fontSize: 13, color: "#64748B", marginBottom: 20 },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  sectionHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: "0.5px solid #E2E8F0" },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#2563EB", flexShrink: 0 },
  sectionTitle: { fontSize: 13, fontWeight: 500, color: "#1B2B4B" },
  label: { fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" },
  input: { width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 11px", fontSize: 13, color: "#1B2B4B", outline: "none", background: "#fff", boxSizing: "border-box" },
  select: { width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 11px", fontSize: 13, color: "#1B2B4B", outline: "none", background: "#fff", boxSizing: "border-box" },
  btnSave: { padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "#2563EB", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 },
  btnDelete: { background: "none", border: "none", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }
};

export default function ExamSchedule() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);

  // Online Exam Configuration
  const [form, setForm] = useState({
    batch: "",
    subject: "",
    date: "",
    examType: "offline",
    startTime: "10:00",
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 40,
    instructions: "1. Read all questions carefully.\n2. Do not refresh or switch tabs during the exam.\n3. Exam will automatically submit when time expires."
  });

  // Online Questions List
  const [questions, setQuestions] = useState([]);
  const [questionTab, setQuestionTab] = useState("manual"); // "manual" or "import"
  const [previewExam, setPreviewExam] = useState(null); // Preview modal target

  // Manual Question Builder State
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    questionType: "mcq",
    options: ["", "", "", ""],
    correctAnswer: "A",
    marks: 1
  });
  const [editingIndex, setEditingIndex] = useState(-1);

  // Excel Import State
  const [excelValidationErrors, setExcelValidationErrors] = useState([]);

  const [filterBatch, setFilterBatch] = useState("");

  useEffect(() => {
    API.get("/batches/public")
      .then((res) => setBatches(res.data || []))
      .catch(() => toast.error("Failed to load batches"));
      
    API.get("/subjects")
      .then((res) => {
        const data = res.data;
        setSubjects(Array.isArray(data) ? data : (data?.subjects || data?.syllabi || []));
      })
      .catch(() => toast.error("Failed to load subjects"));

    fetchExams("");
  }, []);

  const fetchExams = (batchId) => {
    setLoading(true);
    let url = "/exams";
    if (batchId) url += `?batch=${batchId}`;
    
    API.get(url)
      .then((res) => setExams(res.data || []))
      .catch(() => toast.error("Failed to load exams"))
      .finally(() => setLoading(false));
  };

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFilterBatch(val);
    fetchExams(val);
  };

  // Initialize total marks if empty
  useEffect(() => {
    if (form.examType === "online" && questions.length > 0 && (!form.totalMarks || form.totalMarks === 0)) {
      const calculatedMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
      setForm((prev) => ({ ...prev, totalMarks: calculatedMarks }));
    }
  }, [questions.length, form.examType]);

  // Option Management
  const handleAddOptionChoice = () => {
    if (currentQuestion.options.length >= 8) {
      toast.error("Maximum 8 options allowed per question");
      return;
    }
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""]
    }));
  };

  const handleRemoveOptionChoice = (idx) => {
    if (currentQuestion.options.length <= 2) {
      toast.error("At least 2 options are required for MCQ");
      return;
    }
    const newOpts = currentQuestion.options.filter((_, i) => i !== idx);
    let newCorrect = currentQuestion.correctAnswer;
    const removedLetter = String.fromCharCode(65 + idx);
    if (newCorrect === removedLetter) {
      newCorrect = "A";
    }
    setCurrentQuestion((prev) => ({
      ...prev,
      options: newOpts,
      correctAnswer: newCorrect
    }));
  };

  // Manual Question Actions
  const handleAddQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      toast.error("Please enter question text");
      return;
    }

    if (currentQuestion.questionType === "mcq") {
      const emptyOption = currentQuestion.options.some((opt) => !opt.trim());
      if (emptyOption) {
        toast.error("Please fill all option texts for MCQ");
        return;
      }
    }

    if (editingIndex >= 0) {
      const updated = [...questions];
      updated[editingIndex] = { ...currentQuestion };
      setQuestions(updated);
      setEditingIndex(-1);
      toast.success(`Question #${editingIndex + 1} updated`);
    } else {
      setQuestions([...questions, { ...currentQuestion }]);
      toast.success(`Question #${questions.length + 1} added! Ready for next question.`);
    }

    setCurrentQuestion({
      questionText: "",
      questionType: "mcq",
      options: ["", "", "", ""],
      correctAnswer: "A",
      marks: 1
    });
  };

  const handleDuplicateQuestion = (index) => {
    const qToDup = questions[index];
    const dup = {
      ...qToDup,
      questionText: `${qToDup.questionText} (Copy)`
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, dup);
    setQuestions(updated);
    toast.success(`Question #${index + 1} duplicated!`);
  };

  const handleEditQuestion = (index) => {
    setCurrentQuestion({ ...questions[index] });
    setEditingIndex(index);
  };

  const handleDeleteQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    if (editingIndex === index) {
      setEditingIndex(-1);
      setCurrentQuestion({
        questionText: "",
        questionType: "mcq",
        options: ["", "", "", ""],
        correctAnswer: "A",
        marks: 1
      });
    }
  };

  const handleMoveQuestion = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === questions.length - 1)) return;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[index + direction];
    updated[index + direction] = temp;
    setQuestions(updated);
  };

  // Excel Question Import Validator
  const handleExcelImport = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (!data || data.length === 0) {
          toast.error("Uploaded Excel sheet is empty");
          return;
        }

        const errors = [];
        const parsedQuestions = [];

        data.forEach((row, idx) => {
          const rowNum = idx + 2; // Row 1 is header
          const questionText = row["Question"] || row["question"] || row["Question Text"] || "";
          const optA = row["Option A"] || row["option_a"] || row["OptionA"] || row["A"] || "";
          const optB = row["Option B"] || row["option_b"] || row["OptionB"] || row["B"] || "";
          const optC = row["Option C"] || row["option_c"] || row["OptionC"] || row["C"] || "";
          const optD = row["Option D"] || row["option_d"] || row["OptionD"] || row["D"] || "";
          let rawCorrect = row["Correct Answer"] || row["correct_answer"] || row["Answer"] || row["Correct"] || "";
          const marks = Number(row["Marks"] || row["marks"] || 1);

          if (!questionText.toString().trim()) {
            errors.push(`Row ${rowNum}: Question text is missing`);
            return;
          }

          let type = "mcq";
          let options = [String(optA).trim(), String(optB).trim(), String(optC).trim(), String(optD).trim()];
          let correctAnswer = String(rawCorrect).trim();

          // Validation for MCQ
          if (options.every((o) => o !== "")) {
            type = "mcq";
            // Normalize correct answer to A, B, C, or D if it matches option text
            const cleanAnswer = correctAnswer.toUpperCase();
            if (["A", "B", "C", "D"].includes(cleanAnswer)) {
              correctAnswer = cleanAnswer;
            } else {
              const matchedIdx = options.findIndex((o) => o.toLowerCase() === correctAnswer.toLowerCase());
              if (matchedIdx >= 0) {
                correctAnswer = ["A", "B", "C", "D"][matchedIdx];
              } else {
                errors.push(`Row ${rowNum}: Correct Answer '${rawCorrect}' does not match Option A, B, C, or D`);
                return;
              }
            }
          } else if (correctAnswer.toLowerCase() === "true" || correctAnswer.toLowerCase() === "false") {
            type = "true_false";
            options = ["True", "False"];
            correctAnswer = correctAnswer.toLowerCase() === "true" ? "True" : "False";
          } else {
            type = "short_answer";
            options = [];
          }

          parsedQuestions.push({
            questionText: String(questionText).trim(),
            questionType: type,
            options,
            correctAnswer,
            marks: isNaN(marks) || marks <= 0 ? 1 : marks
          });
        });

        setExcelValidationErrors(errors);

        if (parsedQuestions.length > 0) {
          setQuestions((prev) => [...prev, ...parsedQuestions]);
          toast.success(`Successfully imported ${parsedQuestions.length} questions from Excel!`);
        }

        if (errors.length > 0) {
          toast.error(`Found ${errors.length} validation issues in Excel file.`);
        }
      } catch (err) {
        console.error("Excel parse error:", err);
        toast.error("Failed to parse Excel file. Please ensure valid file format.");
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  // Download Sample Excel Format
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        "Question": "What is the primary function of CSS?",
        "Option A": "Database management",
        "Option B": "Styling and visual layout",
        "Option C": "Server-side logic",
        "Option D": "Executing API calls",
        "Correct Answer": "B",
        "Marks": 1
      },
      {
        "Question": "Which HTML tag is used for the largest heading?",
        "Option A": "<h6>",
        "Option B": "<head>",
        "Option C": "<h1>",
        "Option D": "<heading>",
        "Correct Answer": "C",
        "Marks": 1
      },
      {
        "Question": "Is JavaScript a statically typed programming language?",
        "Option A": "True",
        "Option B": "False",
        "Option C": "",
        "Option D": "",
        "Correct Answer": "False",
        "Marks": 1
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questions Template");
    XLSX.writeFile(workbook, "Online_Exam_Questions_Template.xlsx");
  };

  const handleSave = async () => {
    if (!form.batch || !form.subject || !form.date || !form.examType) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Check if date is in the past
    const examDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (examDate < today) {
      toast.error("Exam date cannot be in the past");
      return;
    }

    if (form.examType === "online" && questions.length === 0) {
      toast.error("Please add at least one question for the Online Exam");
      return;
    }

    try {
      setSaving(true);
      
      let questionPaperData = null;
      if (form.examType === "offline" && file) {
        toast.loading("Uploading question paper...", { id: "upload" });
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await API.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        questionPaperData = {
          fileName: uploadRes.data.originalName || file.name,
          fileUrl: uploadRes.data.fileUrl
        };
        toast.dismiss("upload");
      }
      
      const payload = {
        ...form,
        ...(form.examType === "online" && { questions }),
        ...(questionPaperData && { questionPaper: questionPaperData })
      };
      
      await API.post("/exams", payload);
      toast.success("Exam scheduled successfully!");
      
      // Reset form
      setForm({
        batch: "",
        subject: "",
        date: "",
        examType: "offline",
        startTime: "10:00",
        durationMinutes: 60,
        totalMarks: 100,
        passingMarks: 40,
        instructions: "1. Read all questions carefully.\n2. Do not refresh or switch tabs during the exam.\n3. Exam will automatically submit when time expires."
      });
      setQuestions([]);
      setFile(null);
      setExcelValidationErrors([]);
      fetchExams(filterBatch);
    } catch (err) {
      toast.dismiss("upload");
      toast.error(err.response?.data?.message || "Failed to schedule exam");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await API.delete(`/exams/${id}`);
      toast.success("Exam deleted");
      fetchExams(filterBatch);
    } catch (err) {
      toast.error("Failed to delete exam");
    }
  };

  return (
    <div style={S.page}>
      <Toaster position="top-right" />
      <p style={S.pageTitle}>Exam Schedule & Question Paper Builder</p>
      <p style={S.pageSubtitle}>Schedule exams, build online question papers, or upload offline PDFs</p>

      {/* Schedule Form */}
      <div style={S.card}>
        <div style={S.sectionHeader}>
          <div style={S.dot} />
          <span style={S.sectionTitle}>1. Basic Exam Setup</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label style={S.label}>Batch *</label>
            <select style={S.select} value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}>
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>{b.batch_name} (#{b.batch_no})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={S.label}>Subject / Exam Title *</label>
            <select style={S.select} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              <option value="">Select Subject</option>
              {subjects.map((s) => {
                const sName = s.subject || s.name || s.title;
                return <option key={s._id || sName} value={sName}>{sName}</option>;
              })}
            </select>
          </div>
          <div>
            <label style={S.label}>Exam Date *</label>
            <input 
              type="date" 
              style={S.input} 
              value={form.date} 
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, date: e.target.value })} 
            />
          </div>
          <div>
            <label style={S.label}>Exam Type *</label>
            <select style={S.select} value={form.examType} onChange={(e) => {
              setForm({ ...form, examType: e.target.value });
              if (e.target.value === "online") setFile(null);
            }}>
              <option value="offline">Offline (PDF Paper)</option>
              <option value="online">Online (Built-in Quiz)</option>
            </select>
          </div>
        </div>

        {/* Offline Upload Section */}
        {form.examType === "offline" && (
          <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <label style={S.label}>Question Paper PDF/Doc (Optional for offline)</label>
            <div className="flex items-center gap-4">
              <label style={{ ...S.btnSave, background: "#F1F5F9", color: "#475569", border: "1.5px solid #CBD5E1", cursor: "pointer" }}>
                <Upload size={14} /> {file ? "Change File" : "Upload Question Paper"}
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              </label>
              {file && <span style={{ fontSize: 13, color: "#1B2B4B", fontWeight: 500 }}>{file.name}</span>}
            </div>
          </div>
        )}

        {/* Online Exam Configuration */}
        {form.examType === "online" && (
          <div className="space-y-4 pt-2 border-t border-slate-200 mt-4">
            <div style={S.sectionHeader} className="mb-2">
              <div style={{ ...S.dot, background: "#10B981" }} />
              <span style={S.sectionTitle}>2. Online Exam Rules & Timing</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label style={S.label}>Start Time (HH:MM)</label>
                <input
                  type="time"
                  style={S.input}
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div>
                <label style={S.label}>Duration (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  style={S.input}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label style={S.label}>Total Marks *</label>
                  {questions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const calculatedMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
                        setForm((prev) => ({ ...prev, totalMarks: calculatedMarks }));
                        toast.success(`Total marks updated to ${calculatedMarks}`);
                      }}
                      className="text-[10px] font-bold text-emerald-600 hover:underline"
                      title="Sync Total Marks with sum of question marks"
                    >
                      Sync ({questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0)})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  style={S.input}
                  value={form.totalMarks}
                  onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                  placeholder="e.g. 100"
                />
              </div>
              <div>
                <label style={S.label}>Passing Marks</label>
                <input
                  type="number"
                  style={S.input}
                  value={form.passingMarks}
                  onChange={(e) => setForm({ ...form, passingMarks: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label style={S.label}>Exam Instructions</label>
              <textarea
                rows={2}
                style={{ ...S.input, resize: "vertical" }}
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              />
            </div>

            {/* Question Builder Section */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div style={{ ...S.dot, background: "#8B5CF6" }} />
                  <span style={S.sectionTitle}>3. Question Paper ({questions.length} Questions)</span>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1">
                  <button
                    type="button"
                    onClick={() => setQuestionTab("manual")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                      questionTab === "manual" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Manual Builder
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionTab("import")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                      questionTab === "import" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Import Excel
                  </button>
                </div>
              </div>

              {/* Manual Question Form */}
              {questionTab === "manual" && (
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 uppercase">
                      {editingIndex >= 0 ? `Editing Question #${editingIndex + 1}` : "Add New Question"}
                    </span>
                    {editingIndex >= 0 && (
                      <button
                        onClick={() => {
                          setEditingIndex(-1);
                          setCurrentQuestion({ questionText: "", questionType: "mcq", options: ["", "", "", ""], correctAnswer: "A", marks: 1 });
                        }}
                        className="text-xs text-rose-500 font-bold hover:underline"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div>
                    <label style={S.label}>Question Text *</label>
                    <input
                      type="text"
                      placeholder="e.g. What is the output of console.log(typeof null)?"
                      style={S.input}
                      value={currentQuestion.questionText}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label style={S.label}>Question Type</label>
                      <select
                        style={S.select}
                        value={currentQuestion.questionType}
                        onChange={(e) => {
                          const type = e.target.value;
                          let opts = ["", "", "", ""];
                          let correct = "A";
                          if (type === "true_false") {
                            opts = ["True", "False"];
                            correct = "True";
                          } else if (type === "short_answer") {
                            opts = [];
                            correct = "";
                          }
                          setCurrentQuestion({ ...currentQuestion, questionType: type, options: opts, correctAnswer: correct });
                        }}
                      >
                        <option value="mcq">Multiple Choice (4 Options)</option>
                        <option value="true_false">True / False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>

                    <div>
                      <label style={S.label}>Marks for this question</label>
                      <input
                        type="number"
                        min="1"
                        style={S.input}
                        value={currentQuestion.marks}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: Number(e.target.value) })}
                      />
                    </div>

                    {currentQuestion.questionType === "true_false" && (
                      <div>
                        <label style={S.label}>Correct Answer</label>
                        <select
                          style={S.select}
                          value={currentQuestion.correctAnswer}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                        >
                          <option value="True">True</option>
                          <option value="False">False</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Options Input for MCQ */}
                  {currentQuestion.questionType === "mcq" && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label style={S.label}>Options & Select Correct Answer</label>
                        <button
                          type="button"
                          onClick={handleAddOptionChoice}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                        >
                          <Plus size={12} /> Add Option
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentQuestion.options.map((optVal, idx) => {
                          const letter = String.fromCharCode(65 + idx);
                          return (
                            <div key={idx} className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-lg shadow-2xs">
                              <input
                                type="radio"
                                name="correctAnswerRadio"
                                checked={currentQuestion.correctAnswer === letter}
                                onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: letter })}
                                className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                                title={`Set Option ${letter} as correct answer`}
                              />
                              <span className="text-xs font-extrabold text-slate-700 w-6">{letter}.</span>
                              <input
                                type="text"
                                placeholder={`Option ${letter} text`}
                                className="w-full text-xs outline-none text-slate-800 font-medium"
                                value={optVal || ""}
                                onChange={(e) => {
                                  const newOpts = [...currentQuestion.options];
                                  newOpts[idx] = e.target.value;
                                  setCurrentQuestion({ ...currentQuestion, options: newOpts });
                                }}
                              />
                              {currentQuestion.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOptionChoice(idx)}
                                  className="text-slate-300 hover:text-rose-600 transition p-1"
                                  title="Remove option"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentQuestion.questionType === "short_answer" && (
                    <div>
                      <label style={S.label}>Model Answer / Keywords (Case-insensitive match)</label>
                      <input
                        type="text"
                        placeholder="Expected answer string"
                        style={S.input}
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus size={14} /> {editingIndex >= 0 ? "Update Question" : "Save Question to Paper"}
                    </button>
                  </div>
                </div>
              )}

              {/* Excel Import Tab */}
              {questionTab === "import" && (
                <div className="bg-emerald-50/50 p-4 border border-emerald-200 rounded-xl space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <FileSpreadsheet size={16} /> Excel Question Paper Import
                      </h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Upload an Excel file (.xlsx, .xls, .csv) formatted with Question, Option A-D, Correct Answer, Marks.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={downloadSampleExcel}
                      className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      Download Template
                    </button>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-3 border border-emerald-200 rounded-lg">
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleExcelImport}
                      className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                    />
                  </div>

                  {excelValidationErrors.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <AlertTriangle size={14} /> Found Excel Validation Warnings:
                      </div>
                      <ul className="list-disc pl-5 text-[11px] space-y-0.5 max-h-32 overflow-y-auto">
                        {excelValidationErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Questions List Display */}
              {questions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                    <span>Paper Question List</span>
                    <button
                      type="button"
                      onClick={() => setPreviewExam({ ...form, questions })}
                      className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                    >
                      <Eye size={13} /> Preview Full Question Paper
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {questions.map((q, idx) => (
                      <div key={idx} className="bg-white p-3 border border-slate-200 rounded-lg flex items-start justify-between gap-3 shadow-xs">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-md">
                              Q{idx + 1}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md">
                              {q.questionType}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600">
                              {q.marks} Mark{q.marks > 1 ? "s" : ""}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-slate-800">{q.questionText}</p>

                          {q.questionType === "mcq" && (
                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pl-2">
                              {(q.options || []).map((optText, i) => {
                                const l = String.fromCharCode(65 + i);
                                return (
                                  <span
                                    key={i}
                                    className={q.correctAnswer === l ? "font-extrabold text-emerald-700 bg-emerald-50 px-1 rounded" : ""}
                                  >
                                    {l}. {optText} {q.correctAnswer === l ? "✓" : ""}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {q.questionType !== "mcq" && (
                            <p className="text-[11px] text-emerald-600 font-semibold pl-2">
                              Correct Answer: {q.correctAnswer}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(idx, 1)}
                            disabled={idx === questions.length - 1}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateQuestion(idx)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded border border-emerald-200"
                            title="Duplicate question"
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditQuestion(idx)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-200 mt-4">
          <button style={S.btnSave} onClick={handleSave} disabled={saving}>
            {saving ? "Scheduling..." : form.examType === "online" ? "Publish Online Exam" : "Schedule Exam"}
          </button>
        </div>
      </div>

      {/* Exam List */}
      <div style={S.card}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={S.dot} />
            <span style={S.sectionTitle}>Scheduled Exams</span>
          </div>
          <div style={{ width: 200 }}>
            <select style={{ ...S.select, padding: "6px 10px" }} value={filterBatch} onChange={handleFilterChange}>
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>{b.batch_name} (#{b.batch_no})</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>Loading exams...</div>
        ) : exams.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>No exams scheduled.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div key={exam._id} style={{ border: "1.5px solid #E2E8F0", borderRadius: 10, padding: 16 }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1B2B4B", display: "flex", alignItems: "center", gap: 6 }}>
                    <BookOpen size={16} color="#2563EB" />
                    {exam.subject}
                  </h3>
                  {(user?.role === "admin" || user?.role === "teacher") && (
                    <button style={S.btnDelete} onClick={() => handleDelete(exam._id)} title="Delete Exam">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <p style={{ margin: "0 0 8px 0", fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                  Batch: {exam.batch?.batch_name} (#{exam.batch?.batch_no})
                </p>
                
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px dashed #E2E8F0" }}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-[#475569]">
                      <Calendar size={14} />
                      <span style={{ fontSize: 12, fontWeight: 500 }}>
                        {new Date(exam.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#475569]">
                      {exam.examType === "online" ? <Monitor size={14} color="#10B981" /> : <Building2 size={14} color="#F59E0B" />}
                      <span style={{ fontSize: 12, fontWeight: 600, color: exam.examType === "online" ? "#10B981" : "#F59E0B", textTransform: "capitalize" }}>
                        {exam.examType}
                      </span>
                    </div>
                  </div>
                </div>

                {exam.examType === "online" && (
                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><Clock size={12} /> {exam.startTime || "10:00"} ({exam.durationMinutes || 60} mins)</span>
                      <span>Total: {exam.totalMarks || 100} Marks</span>
                    </div>
                    <button
                      onClick={() => setPreviewExam(exam)}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye size={14} /> View Question Paper ({exam.questions ? exam.questions.length : 0} Questions)
                    </button>
                  </div>
                )}
                
                {exam.examType === "offline" && exam.questionPaper?.fileUrl && (
                  <button
                    onClick={() => window.open(exam.questionPaper.fileUrl, "_blank")}
                    style={{
                      width: "100%",
                      marginTop: 12,
                      padding: "8px 0",
                      background: "#F1F5F9",
                      border: "1.5px solid #CBD5E1",
                      borderRadius: 8,
                      color: "#475569",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <FileText size={14} /> View Offline Question Paper
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Paper Preview Modal */}
      {previewExam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto font-['DM_Sans',sans-serif]">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase rounded-lg border border-emerald-100">
                  Online Question Paper Preview
                </span>
                <h2 className="text-xl font-black text-slate-800 mt-1">{previewExam.subject}</h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Scheduled Date: {new Date(previewExam.date).toLocaleDateString()} | Start Time: {previewExam.startTime || "10:00"}
                </p>
              </div>

              <button
                onClick={() => setPreviewExam(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Paper Overview Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Duration</span>
                <p className="text-sm font-black text-slate-800">{previewExam.durationMinutes || 60} Mins</p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Total Questions</span>
                <p className="text-sm font-black text-slate-800">{previewExam.questions ? previewExam.questions.length : 0}</p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Total Marks</span>
                <p className="text-sm font-black text-emerald-600">{previewExam.totalMarks || 100}</p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Passing Marks</span>
                <p className="text-sm font-black text-indigo-600">{previewExam.passingMarks || 40}</p>
              </div>
            </div>

            {previewExam.instructions && (
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-bold block mb-1">Instructions:</span>
                <p className="whitespace-pre-line text-amber-800">{previewExam.instructions}</p>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                Questions List ({previewExam.questions ? previewExam.questions.length : 0})
              </h3>

              {!previewExam.questions || previewExam.questions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No questions added yet.</p>
              ) : (
                previewExam.questions.map((q, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl space-y-2 bg-white shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-700">Question #{idx + 1}</span>
                      <span className="font-bold text-emerald-600">{q.marks || 1} Mark{q.marks > 1 ? "s" : ""}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-900">{q.questionText}</p>

                    {q.questionType === "mcq" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        {["A", "B", "C", "D"].map((letter, i) => (
                          <div
                            key={letter}
                            className={`p-2 rounded-lg text-xs border flex items-center justify-between ${
                              q.correctAnswer === letter
                                ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <span>{letter}. {q.options[i]}</span>
                            {q.correctAnswer === letter && <CheckCircle size={14} className="text-emerald-600" />}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.questionType !== "mcq" && (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
                        Answer Key: {q.correctAnswer}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                onClick={() => setPreviewExam(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
