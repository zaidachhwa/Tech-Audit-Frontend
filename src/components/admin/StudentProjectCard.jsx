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
      className={`p-4 rounded-xl bg-white border-[1.5px] border-[#E2E8F0] shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-[2px] ${
        compact ? "" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-semibold text-[#1B2B4B]">
            {title}
          </div>

          {!compact && (
            <div className="text-[13px] text-[#64748B] mt-1 line-clamp-3">
              {desc}
            </div>
          )}
        </div>

        <div className="text-right">
          <div
            className={`px-3 py-[3px] rounded-full text-[12px] font-semibold ${
              status === "Approved" || status === "approved"
                ? "bg-[#ECFDF5] text-[#065F46]"
                : "bg-[#EFF6FF] text-[#1E40AF]"
            }`}
          >
            {status === "Approved" || status === "approved"
              ? "Approved"
              : "Pending"}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[13px] text-[#64748B]">
          <GitBranch size={14} />
          {repo ? (
            <a
              href={repo}
              target="_blank"
              rel="noreferrer"
              className="text-[#2563EB] hover:underline font-medium"
            >
              Repo
            </a>
          ) : (
            <span className="text-[#94A3B8]">No repo</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {project._id && (
            <Link
              to={`/admin/project/${project._id}`}
              className="text-[13px] font-medium text-[#1B2B4B] border border-[#E2E8F0] px-3 py-1 rounded-lg hover:bg-[#F8FAFC]"
            >
              Details
            </Link>
          )}

          {onApprove && (
            <button
              onClick={onApprove}
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-[13px] font-medium"
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