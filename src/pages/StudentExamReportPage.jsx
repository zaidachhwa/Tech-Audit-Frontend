import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API } from "../api/axios";
import StudentExamReportView from "../components/admin/StudentExamReportView";
import toast from "react-hot-toast";
import {
  Award,
  Search,
  User,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Users
} from "lucide-react";

export default function StudentExamReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(searchParams.get("studentId") || "");

  // Sync selectedStudentId with URL param
  useEffect(() => {
    const paramId = searchParams.get("studentId");
    if (paramId) {
      setSelectedStudentId(paramId);
    }
  }, [searchParams]);

  // Fetch all students for the selector
  useEffect(() => {
    const fetchStudentsList = async () => {
      try {
        setLoadingStudents(true);
        const res = await API.get("/students/list?limit=500");
        const list = res.data?.students || res.data || [];
        setStudents(list);

        // If no student selected yet and list has students, auto-select first or wait for user
        if (!selectedStudentId && searchParams.get("studentId")) {
          setSelectedStudentId(searchParams.get("studentId"));
        }
      } catch (err) {
        console.error("Failed to load students list:", err);
        toast.error("Failed to load student directory");
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudentsList();
  }, []);

  const handleSelectStudent = (id) => {
    setSelectedStudentId(id);
    setSearchParams({ studentId: id });
  };

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  const filteredStudents = students.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.enrollmentNo?.toLowerCase().includes(term) ||
      s.rollNo?.toLowerCase().includes(term) ||
      s.batch_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen font-sans" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* PAGE HEADER */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#0F3C8A] text-white rounded-xl shadow-md">
              <Award size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Exam Report</h1>
              <p className="text-xs text-slate-500 font-medium">
                Analyze student performance trajectory, score progression, and improvement metrics across all exams
              </p>
            </div>
          </div>
        </div>

        {/* Student Dropdown / Search Input */}
        <div className="w-full md:w-80 relative">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
            Select Student
          </label>
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={(e) => handleSelectStudent(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3C8A]/20 transition cursor-pointer appearance-none pr-8"
            >
              <option value="">-- Choose a Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.batch_name || "Batch"} #{s.batch_no || ""})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* REPORT CONTENT AREA */}
      {selectedStudentId ? (
        <div className="space-y-6">
          {/* Selected Student Banner Card */}
          {selectedStudent && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#0F3C8A] text-white flex items-center justify-center font-extrabold text-base shadow-md">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedStudent.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                    <span>Batch: <strong className="text-[#0F3C8A]">{selectedStudent.batch_name} #{selectedStudent.batch_no}</strong></span>
                    <span>•</span>
                    <span>Email: <strong className="text-slate-700">{selectedStudent.email}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/admin/student/${selectedStudent._id}`)}
                  className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <User size={13} /> View Full Profile
                </button>
              </div>
            </div>
          )}

          {/* Full Exam Report View */}
          <StudentExamReportView studentId={selectedStudentId} />
        </div>
      ) : (
        /* NO STUDENT SELECTED WELCOME CARD */
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="text-center max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0F3C8A] flex items-center justify-center mx-auto shadow-inner">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Select a Student to View Exam Report</h2>
            <p className="text-xs text-slate-500 font-medium">
              Choose any student from the dropdown menu above or search below to inspect their detailed exam trajectory and performance metrics.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-md mx-auto relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student by name, email, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3C8A]/20 transition"
            />
          </div>

          {/* Student Grid Cards */}
          {loadingStudents ? (
            <div className="text-center py-8 text-slate-400 text-xs font-bold">
              <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-[#0F3C8A]" />
              Loading student directory...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {filteredStudents.map((s) => (
                <div
                  key={s._id}
                  onClick={() => handleSelectStudent(s._id)}
                  className="p-3.5 bg-slate-50/70 border border-slate-200/80 hover:border-[#0F3C8A]/40 hover:bg-blue-50/30 rounded-xl cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0F3C8A] font-extrabold text-xs flex items-center justify-center shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-[#0F3C8A] transition truncate">
                        {s.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        {s.batch_name} #{s.batch_no}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-[#0F3C8A] transition shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
