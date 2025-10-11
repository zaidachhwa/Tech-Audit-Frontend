import React, { useState, useRef, useEffect } from "react";
import ReportForm from "./components/ReportForm";
import TechAuditReport from "./components/TechAuditReport";
import generatePDF from "./utils/generatePDF";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import { supabase } from "./services/supabase";
import headImage from "./assets/letter_head.jpg";
import StudentsDashboard from "./components/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) resolve(null);
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting user:", error.message);
        navigate("/login");
        return;
      }
      if (!data?.user) navigate("/login");
    };

    getUser();
  }, [navigate]);

  const [student, setStudent] = useState({
    batch: "",
    dateRaw: "",
    date: "",
    firstname: "",
    lastname: "",
    feedbackLines: ["", "", ""],
    email: "",
    phone: "",
    skills: [
      { label: "JavaScript", key: "js", value: "", enabled: true },
      { label: "React", key: "react", value: "", enabled: true },
      { label: "DevOps", key: "devops", value: "", enabled: true },
      { label: "HTML", key: "html", value: "", enabled: true },
      { label: "CSS & Tailwind", key: "css", value: "", enabled: true },
      { label: "Next Js", key: "next_js", value: "", enabled: true },
    ],
    logo: headImage,
    signature: null,
    watermarkImage: null,
    watermarkText: "",
    watermarkEnabled: false,
  });

  const previewRef = useRef();
  const update = (key, value) => setStudent((p) => ({ ...p, [key]: value }));

  const handleDateChange = (isoDate) => {
    if (!isoDate) return update("date", "");
    const d = new Date(isoDate + "T00:00:00");
    const day = d.getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";
    const month = d.toLocaleString("default", { month: "long" });
    const year = d.getFullYear();
    update("dateRaw", isoDate);
    update("date", `${day}${suffix} ${month} ${year}`);
  };

  const handleFileUpload = async (field, file) => {
    if (!file) return;
    const url = await fileToDataUrl(file);
    update(field, url);
  };

  const handleSkillChange = (index, field, value) => {
    const copy = [...student.skills];
    copy[index][field] = value;
    update("skills", copy);
  };

  const addSkill = () =>
    update("skills", [
      ...student.skills,
      {
        label: `New Skill ${student.skills.length + 1}`,
        key: "",
        value: "",
        enabled: true,
      },
    ]);

  const handleFeedbackChange = (idx, value) => {
    const copy = [...student.feedbackLines];
    copy[idx] = value;
    update("feedbackLines", copy);
  };

  const handleDownload = async () => {
    await generatePDF(
      previewRef.current,
      `${student.firstname}_${student.batch}_Report`
    );
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-5">
              <h1 className="text-2xl font-bold text-sky-600 text-center mb-6">
                Tech Audit Generator
              </h1>

              <div className="mx-auto flex flex-col lg:flex-row gap-6">
                <ReportForm
                  student={student}
                  onChange={update}
                  onDateChange={handleDateChange}
                  onFileUpload={handleFileUpload}
                  onSkillChange={handleSkillChange}
                  onAddSkill={addSkill}
                  onFeedbackChange={handleFeedbackChange}
                  onDownload={handleDownload}
                />

                <div className="flex justify-center w-full">
                  <div
                    ref={previewRef}
                    className="report-a4 bg-white flex items-center justify-center rounded shadow-md"
                  >
                    <TechAuditReport student={student} />
                  </div>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute>
            <StudentsDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
