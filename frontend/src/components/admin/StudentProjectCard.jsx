// src/components/admin/StudentProjectCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { GitBranch, BadgeCheck } from "lucide-react";

/**
 * StudentProjectCard
 * - project: object
 * - compact: boolean — shows smaller card if true
 * - onApprove: optional callback to approve this project
 */
export default function StudentProjectCard({
  project,
  compact = false,
  onApprove,
}) {
  const title = project.title || project.name || "Untitled Project";
  const desc = project.description || project.desc || "";
  const repo = project.repo || project.repository || project.repoUrl || "";
  const status =
    project.overallStatus ||
    project.status ||
    (project.isApproved
      ? "approved"
      : project.approvalStatus
      ? "approved"
      : "pending");

  return (
    <div
      className={`p-4 rounded-2xl shadow-md ${
        compact ? "bg-white/70" : "bg-gradient-to-br from-white to-slate-50"
      } border border-transparent hover:shadow-lg transition`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium text-slate-800">{title}</div>
          {!compact && (
            <div className="text-sm text-slate-500 mt-1 line-clamp-3">
              {desc}
            </div>
          )}
        </div>

        <div className="text-right">
          <div
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              status === "Approved" || status === "approved"
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {status === "Approved" || status === "approved"
              ? "Approved"
              : "Pending"}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <GitBranch size={14} />
          {repo ? (
            <a
              href={repo}
              target="_blank"
              rel="noreferrer"
              className="text-purple-700 hover:underline"
            >
              Repo
            </a>
          ) : (
            <span className="text-slate-400">No repo</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {project._id && (
            <Link
              to={`/admin/project/${project._id}`}
              className="text-sm text-purple-700 hover:underline"
            >
              Details
            </Link>
          )}
          {onApprove && (
            <button
              onClick={onApprove}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg"
              title="Approve project"
            >
              <BadgeCheck size={14} />
              Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
