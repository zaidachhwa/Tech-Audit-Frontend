import React, { useEffect, useState } from "react";
import { API } from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { Trophy, Medal, Search, Calendar as CalendarIcon } from "lucide-react";

export default function Leaderboard() {
  const [batches, setBatches] = useState([]);
  const [filterBatch, setFilterBatch] = useState("");
  
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  
  const [leaderboard, setLeaderboard] = useState([]);
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

  // When batch changes, fetch exams for that batch
  useEffect(() => {
    if (filterBatch) {
      API.get(`/exams?batch=${filterBatch}`)
        .then((res) => {
          setExams(res.data || []);
          if (res.data && res.data.length > 0) {
            setSelectedExam(res.data[0]._id);
          } else {
            setSelectedExam("");
            setLeaderboard([]);
          }
        })
        .catch(() => toast.error("Failed to load exams"));
    }
  }, [filterBatch]);

  // When exam changes, fetch leaderboard
  useEffect(() => {
    if (selectedExam) {
      fetchLeaderboard(selectedExam);
    }
  }, [selectedExam]);

  const fetchLeaderboard = async (examId) => {
    try {
      setLoading(true);
      const res = await API.get(`/exam-results/leaderboard/${examId}`);
      setLeaderboard(res.data || []);
    } catch (err) {
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (index) => {
    if (index === 0) return "bg-yellow-100 text-yellow-700 border-yellow-200"; // Gold
    if (index === 1) return "bg-gray-100 text-gray-700 border-gray-200"; // Silver
    if (index === 2) return "bg-orange-100 text-orange-700 border-orange-200"; // Bronze
    return "bg-white text-slate-600 border-slate-100";
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="p-2 sm:p-6 pb-24">
      <Toaster position="top-right" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-50 text-orange-600">
          <Trophy size={18} />
        </div>
        <div>
          <h1 className="font-bold text-xl text-slate-800">Exam Leaderboard</h1>
          <p className="text-sm text-slate-500">Student rankings by exam</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
          <label className="block mb-2 text-[13px] font-semibold text-slate-600">Select Batch</label>
          <select 
            className="w-full p-2.5 border-1.5 border-slate-200 rounded-lg text-sm outline-none"
            value={filterBatch} 
            onChange={(e) => setFilterBatch(e.target.value)}
          >
            <option value="">-- Select a Batch --</option>
            {batches.map(b => (
              <option key={b._id} value={b._id}>{b.batch_name} - {b.batch_no}</option>
            ))}
          </select>
        </div>
        
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
          <label className="block mb-2 text-[13px] font-semibold text-slate-600">Select Exam</label>
          <select 
            className="w-full p-2.5 border-1.5 border-slate-200 rounded-lg text-sm outline-none"
            value={selectedExam} 
            onChange={(e) => setSelectedExam(e.target.value)}
            disabled={exams.length === 0}
          >
            <option value="">-- Select an Exam --</option>
            {exams.map(e => (
              <option key={e._id} value={e._id}>{e.subject} - {new Date(e.date).toLocaleDateString()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Medal size={16} className="text-blue-600" /> Rankings
          </h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading rankings...</div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {selectedExam ? "No results published for this exam yet." : "Please select an exam to view rankings."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold w-16 text-center">Rank</th>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold text-center">Score</th>
                  <th className="py-3 px-4 font-semibold text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((result, idx) => (
                  <tr key={result._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-sm border ${getRankColor(idx)}`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{result.student?.name}</div>
                      <div className="text-xs text-slate-500">{result.student?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">
                      {result.marksObtained} <span className="text-slate-400 font-normal text-xs">/ {result.totalMarks}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${result.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {result.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
