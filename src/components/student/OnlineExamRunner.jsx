import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Lock,
  Award,
  BookOpen,
  HelpCircle,
  RotateCcw
} from "lucide-react";

export default function OnlineExamRunner() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: answerString }
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [examCompleted, setExamCompleted] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);

  // Security & Multi-tab states
  const [sessionId, setSessionId] = useState("");
  const [tabConflict, setTabConflict] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Broadcast channel for multi-tab check
  const channelRef = useRef(null);

  useEffect(() => {
    // 1. Generate or retrieve unique session token for this browser tab
    let sid = sessionStorage.getItem(`exam_session_${examId}`);
    if (!sid) {
      sid = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem(`exam_session_${examId}`, sid);
    }
    setSessionId(sid);

    // 2. Setup BroadcastChannel to detect duplicate tab
    try {
      const channel = new BroadcastChannel(`exam_session_channel_${examId}`);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === "PING_ACTIVE_TAB") {
          channel.postMessage({ type: "PONG_ACTIVE_TAB", sid });
        } else if (event.data?.type === "PONG_ACTIVE_TAB" && event.data.sid !== sid) {
          setTabConflict(true);
        }
      };

      // Announce presence
      channel.postMessage({ type: "PING_ACTIVE_TAB", sid });
    } catch (e) {
      console.warn("BroadcastChannel not supported in this browser environment");
    }

    // 3. Tab Visibility Warning
    const handleVisibilityChange = () => {
      if (document.hidden && !examCompleted) {
        setTabSwitchCount((prev) => {
          const nextCount = prev + 1;
          toast.error(`Warning #${nextCount}: Switching tabs or leaving the exam window is logged!`, { id: "tab-switch-warn" });
          return nextCount;
        });

        // Log tab switch to server
        if (attemptId) {
          API.post("/online-exams/tab-switch", { attemptId, sessionId: sid }).catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 4. Initialize or Resume Attempt
    initAttempt(sid);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [examId]);

  // Server Countdown Timer Tick
  useEffect(() => {
    if (remainingSeconds <= 0 || examCompleted || tabConflict) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, examCompleted, tabConflict]);

  // Periodic Timer Sync with Server (Every 30 Seconds)
  useEffect(() => {
    if (!attemptId || examCompleted || tabConflict) return;

    const syncInterval = setInterval(() => {
      API.post("/online-exams/sync-timer", { attemptId, sessionId })
        .then((res) => {
          if (res.data.expired || res.data.status === "auto_submitted" || res.data.status === "completed") {
            setRemainingSeconds(0);
            setExamCompleted(true);
            toast.error("Exam time expired!");
          } else if (res.data.remainingSeconds !== undefined) {
            setRemainingSeconds(res.data.remainingSeconds);
          }
        })
        .catch(() => {});
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [attemptId, sessionId, examCompleted, tabConflict]);

  const initAttempt = async (sid) => {
    try {
      setLoading(true);
      const res = await API.post(`/online-exams/start/${examId}`, { sessionId: sid });
      
      const { attemptId: attId, exam: examData, savedAnswers, remainingSeconds: remSec, status } = res.data;

      setExam(examData);
      setAttemptId(attId);
      setRemainingSeconds(remSec);

      // Restore saved answers
      const answersObj = {};
      (savedAnswers || []).forEach((a) => {
        answersObj[a.questionId] = a.answer;
      });
      setAnswers(answersObj);

      if (status === "completed" || status === "auto_submitted") {
        setExamCompleted(true);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to start exam attempt";
      toast.error(msg);
      if (err.response?.status === 400 && err.response?.data?.attempt) {
        setExamCompleted(true);
        setResultSummary(err.response.data.attempt);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save Answer Handler
  const handleSelectAnswer = async (questionId, value) => {
    if (examCompleted || tabConflict) return;

    // Update local state immediately
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);

    // Save to backend asynchronously
    try {
      setSavingAnswer(true);
      await API.post("/online-exams/save-answer", {
        attemptId,
        questionId,
        answer: value,
        sessionId
      });
    } catch (err) {
      if (err.response?.status === 403) {
        setTabConflict(true);
        toast.error("Session Conflict: Exam is open in another tab!");
      } else if (err.response?.data?.expired) {
        setRemainingSeconds(0);
        setExamCompleted(true);
        toast.error("Exam time expired!");
      }
    } finally {
      setSavingAnswer(false);
    }
  };

  // Auto Submission when timer hits 0
  const handleAutoSubmit = async () => {
    if (examCompleted) return;
    toast.loading("Time expired! Auto-submitting exam...", { id: "autosubmit" });
    try {
      const res = await API.post("/online-exams/submit", { attemptId, sessionId });
      setResultSummary(res.data.result);
      setExamCompleted(true);
      toast.success("Exam submitted automatically!", { id: "autosubmit" });
    } catch (err) {
      toast.dismiss("autosubmit");
      setExamCompleted(true);
    }
  };

  // Manual Submission
  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      toast.loading("Submitting exam...", { id: "submitting" });
      const res = await API.post("/online-exams/submit", { attemptId, sessionId });
      setResultSummary(res.data.result);
      setExamCompleted(true);
      setConfirmSubmitOpen(false);
      toast.success("Exam submitted successfully!", { id: "submitting" });
    } catch (err) {
      toast.dismiss("submitting");
      toast.error(err.response?.data?.message || "Failed to submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  // Format Timer HH:MM:SS
  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-['DM_Sans',sans-serif]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-300">Initializing Exam Session...</p>
        </div>
      </div>
    );
  }

  // Multi-tab Conflict Screen
  if (tabConflict) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-['DM_Sans',sans-serif]">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-black text-white">Active Exam Session Detected</h2>
          <p className="text-xs text-slate-300">
            You already have this online exam open in another browser tab or window. To maintain exam integrity, only one active tab is allowed.
          </p>
          <div className="pt-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Resume in This Tab
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Exam Completed / Result Screen
  if (examCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['DM_Sans',sans-serif]">
        <Toaster position="top-right" />
        <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-8 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-inner">
            <Award size={40} />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-full">
              Exam Submitted
            </span>
            <h1 className="text-2xl font-black text-slate-800 mt-2">{exam?.subject || "Online Exam"}</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">Your responses have been saved and evaluated.</p>
          </div>

          {resultSummary && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Score Obtained</span>
                  <p className="text-xl font-black text-slate-800">{resultSummary.score} / {resultSummary.totalMarks}</p>
                </div>
                <div className="bg-white p-3 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Percentage</span>
                  <p className="text-xl font-black text-indigo-600">{resultSummary.percentage}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-bold">
                <span className="text-slate-500">Result Status:</span>
                <span
                  className={`px-3 py-1 text-xs font-extrabold uppercase rounded-lg border ${
                    resultSummary.status === "Pass"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-rose-50 text-rose-600 border-rose-200"
                  }`}
                >
                  {resultSummary.status}
                </span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => navigate("/student/exams")}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Return to My Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questions = exam?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).filter((k) => answers[k] && answers[k].trim() !== "").length;

  return (
    <div className="h-[calc(100vh-5rem)] bg-slate-900 text-white flex flex-col font-['DM_Sans',sans-serif] selection:bg-emerald-500 selection:text-white overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      <Toaster position="top-right" />

      {/* TOP HEADER */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700/80 px-4 py-2.5 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/student/online-exams")}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
              title="Exit Exam"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm font-extrabold text-white flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-400" />
                {exam?.subject || "Online Exam"}
              </h1>
              <span className="text-[10px] text-slate-400 font-semibold">
                Answered {answeredCount} of {questions.length} Questions
              </span>
            </div>
          </div>

          {/* TIMER DISPLAY */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
              remainingSeconds < 300
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                : "bg-slate-900/80 text-emerald-400 border-slate-700"
            }`}
          >
            <Clock size={16} />
            <span className="text-sm font-black font-mono tracking-wider">
              {formatTimer(remainingSeconds)}
            </span>
          </div>

          {/* FINISH BUTTON */}
          <button
            onClick={() => setConfirmSubmitOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Send size={14} /> Submit Exam
          </button>
        </div>
      </header>

      {/* MAIN EXAM PLAYER CONTAINER */}
      <main className="flex-1 overflow-hidden max-w-7xl w-full mx-auto p-3 md:p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEFT / MAIN QUESTION CARD (3 COLS) */}
        <div className="lg:col-span-3 flex flex-col justify-between overflow-hidden space-y-3">
          {currentQuestion && (
            <div className="flex-1 overflow-y-auto bg-slate-800/80 border border-slate-700 rounded-2xl p-4 md:p-5 shadow-xl space-y-4 pr-2">
              {/* Question Top Header */}
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black rounded-lg">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-700 text-slate-300 text-[10px] font-extrabold uppercase rounded-lg">
                    {currentQuestion.questionType}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {currentQuestion.marks || 1} Mark{currentQuestion.marks > 1 ? "s" : ""}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-base md:text-lg font-bold text-slate-100 leading-relaxed">
                {currentQuestion.questionText}
              </h2>

              {/* Options */}
              {currentQuestion.questionType === "mcq" && (
                <div className="space-y-3 pt-2">
                  {(currentQuestion.options || []).map((optionText, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const optionValue = letter;
                    const isSelected = answers[currentQuestion._id] === optionValue;

                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => handleSelectAnswer(currentQuestion._id, optionValue)}
                        className={`w-full p-4 rounded-xl text-left border transition flex items-center justify-between ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md"
                            : "bg-slate-900/40 border-slate-700/80 text-slate-200 hover:bg-slate-700/50 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border ${
                              isSelected
                                ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-xs md:text-sm font-semibold">{optionText}</span>
                        </div>

                        {isSelected && <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.questionType === "true_false" && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {["True", "False"].map((opt) => {
                    const isSelected = answers[currentQuestion._id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectAnswer(currentQuestion._id, opt)}
                        className={`p-5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md"
                            : "bg-slate-900/40 border-slate-700/80 text-slate-200 hover:bg-slate-700/50"
                        }`}
                      >
                        <span className="text-base font-black">{opt}</span>
                        {isSelected && <CheckCircle2 size={20} className="text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.questionType === "short_answer" && (
                <div className="pt-2">
                  <textarea
                    rows={4}
                    placeholder="Type your answer here..."
                    className="w-full p-4 bg-slate-900/60 border border-slate-700 rounded-xl text-xs md:text-sm text-slate-100 outline-none focus:border-emerald-500 transition"
                    value={answers[currentQuestion._id] || ""}
                    onChange={(e) => handleSelectAnswer(currentQuestion._id, e.target.value)}
                  />
                </div>
              )}

              {savingAnswer && (
                <div className="text-[10px] text-emerald-400 font-semibold text-right flex items-center justify-end gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Saving response...
                </div>
              )}
            </div>
          )}

          {/* QUESTION NAVIGATION BOTTOM CONTROLS */}
          <div className="flex-shrink-0 flex items-center justify-between pt-1">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 transition disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {answers[currentQuestion?._id] && (
              <button
                onClick={() => handleSelectAnswer(currentQuestion._id, "")}
                className="text-xs text-rose-400 hover:underline font-bold flex items-center gap-1"
              >
                <RotateCcw size={12} /> Clear Choice
              </button>
            )}

            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition disabled:opacity-40 shadow-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT QUESTION PALETTE & STATUS (1 COL) */}
        <div className="lg:col-span-1 overflow-y-auto max-h-full space-y-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-xl">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Question Navigator</h3>

            {/* Question Buttons Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isAnswered = answers[q._id] && answers[q._id].trim() !== "";
                const isCurrent = currentQuestionIndex === idx;

                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-10 text-xs font-bold rounded-xl transition flex items-center justify-center border ${
                      isCurrent
                        ? "bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-500/30"
                        : isAnswered
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-900/60 text-slate-400 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-700/80 space-y-2 text-[11px] font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-md" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500/30 border border-emerald-500 rounded-md" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-900 border border-slate-700 rounded-md" />
                <span>Unanswered ({questions.length - answeredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CONFIRMATION SUBMIT MODAL */}
      {confirmSubmitOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <Send size={28} />
            </div>
            <h3 className="text-lg font-black text-white">Submit Online Exam?</h3>
            <p className="text-xs text-slate-300">
              You have answered <strong className="text-emerald-400">{answeredCount}</strong> out of <strong className="text-slate-100">{questions.length}</strong> questions.
              Once submitted, you cannot change your answers.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmSubmitOpen(false)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition"
              >
                Continue Exam
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                {submitting ? "Submitting..." : "Yes, Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
