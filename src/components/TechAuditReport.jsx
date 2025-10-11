import React from "react";

const ScoreBadge = ({ score }) => {
  const n = parseFloat(score);
  let cls = "bg-gray-100 text-gray-800 border border-gray-200";
  if (!isNaN(n)) {
    if (n >= 8) cls = "bg-green-50 text-green-700 border border-green-300";
    else if (n >= 5)
      cls = "bg-yellow-50 text-yellow-700 border border-yellow-300";
    else cls = "bg-red-50 text-red-700 border border-red-300";
  }
  return (
    <span
      className={`inline-block min-w-[60px] px-3 py-1 rounded-md text-sm font-semibold text-center ${cls}`}
    >
      {score || "__ / 10"}
    </span>
  );
};

const TechAuditReport = ({ student }) => {
  const activeSkills = (student.skills || []).filter((s) => s.enabled);

  return (
    <div className="relative font-serif bg-white text-slate-800 px-3 w-full min-w-[210mm] min-h-[297mm] flex flex-col justify-between">
      {/* Watermark (image or text) */}
      {student.watermarkEnabled && (
        <>
          {student.watermarkImage ? (
            <img
              src={student.watermarkImage}
              alt="watermark"
              style={{
                position: "absolute",
                top: "30%",
                left: "50%",
                transform: "translate(-50%,-50%) rotate(-20deg)",
                opacity: 0.07,
                width: "70%",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%,-50%) rotate(-30deg)",
                opacity: 0.06,
                fontSize: 72,
                fontWeight: 800,
                color: "#000",
                letterSpacing: 6,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {student.watermarkText || "CONFIDENTIAL"}
            </div>
          )}
        </>
      )}

      {/* Header */}
      <header className="text-center border-b-2 border-sky-700 w-full pb-3 relative z-10">
        <div className="flex items-center justify-center w-full">
          <div className="w-full mx-auto flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-bold text-sky-700 uppercase mb-1">
              {student.logo ? (
                <img
                  src={student.logo}
                  alt="logo"
                  style={{ objectFit: "contain" }}
                  className="`"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="text-sm text-slate-400">[Logo]</div>
              )}
            </h2>
            <p className="text-sm text-slate-500 italic">
              Batch {student.batch || "__"} | {student.date || "__"}
            </p>
          </div>
        </div>
      </header>

      {/* Student Info */}
      <section className="mt-8 z-10">
        <h2 className="text-lg px-10 font-semibold text-sky-700 mb-2 underline">
          Student Details
        </h2>
        <table className="w-full text-base border border-slate-200">
          <tbody>
            <tr>
              <td className="p-3 font-semibold bg-sky-50 w-1/3">
                Student Name
              </td>
              <td className="p-3">
                {student.firstname || student.lastname
                  ? `${student.firstname || ""} ${
                      student.lastname || ""
                    }`.trim()
                  : "____________________"}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Skills */}
      <section className="mt-8 z-10">
        <h2 className="text-lg font-semibold text-sky-700 mb-2 underline">
          Skill Evaluation
        </h2>
        <table className="w-full border border-slate-200 rounded-lg text-base">
          <thead className="bg-sky-700 text-white">
            <tr>
              <th className="p-3 text-left font-semibold">Skill</th>
              <th className="p-3 text-center font-semibold">Score</th>
            </tr>
          </thead>
          <tbody>
            {activeSkills.map((skill, idx) => (
              <tr
                key={idx}
                className={`border-b border-slate-200 ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                }`}
              >
                <td className="p-3 font-medium">{skill.label}</td>
                <td className="p-3 text-center">
                  <ScoreBadge score={skill.value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Feedback */}
      <section className="mt-8 z-10">
        <h2 className="text-lg font-semibold text-sky-700 mb-2 underline">
          Feedback
        </h2>
        <ul className="bg-sky-50 border border-sky-100 rounded-md p-4 list-disc list-inside space-y-2">
          {student.feedbackLines?.some((f) => f?.trim()) ? (
            student.feedbackLines.map(
              (line, i) => line && <li key={i}>{line}</li>
            )
          ) : (
            <>
              <li>Shows good understanding of core concepts.</li>
              <li>Needs consistent practice in structured coding.</li>
              <li>Overall progress is promising.</li>
            </>
          )}
        </ul>
      </section>

      {/* Signature */}
      <section className="flex justify-between items-end z-10">
        <div className="flex flex-col items-center">
          {student.signature ? (
            <img
              src={student.signature}
              alt="signature"
              style={{ height: 60, width: 200, objectFit: "fill" }}
            />
          ) : (
            <div className="w-48 h-16 border-b border-slate-400 mb-1" />
          )}
          <p className="text-sm font-medium text-slate-600">
            Evaluator’s Signature
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-48 h-16 border-b border-slate-400 mb-1"></div>
          <p className="text-sm font-medium text-slate-600">Stamp</p>
        </div>
      </section>

      <footer className="text-center mt-10 border-t border-slate-300 pt-4 z-10">
        <p className="italic text-slate-600">
          “Every line of code brings you closer to mastery.”
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Generated on {student.date || "__"} | Batch {student.batch || "__"}
        </p>
      </footer>
    </div>
  );
};

export default TechAuditReport;
