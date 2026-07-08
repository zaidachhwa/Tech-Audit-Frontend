/**
 * Reusable Homework Status Configuration & Mapping Helper
 */

export const HomeworkStatuses = {
  ASSIGNED: "assigned",
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const HomeworkStatusLabels = {
  [HomeworkStatuses.ASSIGNED]: "Assigned",
  [HomeworkStatuses.PENDING_REVIEW]: "Pending Review",
  [HomeworkStatuses.APPROVED]: "Approved",
  [HomeworkStatuses.REJECTED]: "Rejected",
};

export const HomeworkStatusColors = {
  [HomeworkStatuses.ASSIGNED]: {
    bg: "#FEF3C7",
    text: "#92400E",
  },
  [HomeworkStatuses.PENDING_REVIEW]: {
    bg: "#DBEAFE",
    text: "#1D4ED8",
  },
  [HomeworkStatuses.APPROVED]: {
    bg: "#DCFCE7",
    text: "#166534",
  },
  [HomeworkStatuses.REJECTED]: {
    bg: "#FEE2E2",
    text: "#B91C1C",
  },
};

/**
 * Get the badge information (label, bg color, text color, and style object) for a given homework status.
 * Normalizes variations in backend/database status values to ensure smooth display.
 * 
 * @param {string} status - Raw status value from backend
 * @returns {object} Badge config with label, bg, color, and style
 */
export function getHomeworkStatusBadge(status) {
  let s = (status || "").toLowerCase();

  // Normalize legacy status strings
  if (s === "pending approval" || s === "pending_approval" || s === "submitted") {
    s = HomeworkStatuses.PENDING_REVIEW;
  } else if (s === "completed") {
    s = HomeworkStatuses.APPROVED;
  }

  // Fallback to assigned
  if (!Object.values(HomeworkStatuses).includes(s)) {
    s = HomeworkStatuses.ASSIGNED;
  }

  const label = HomeworkStatusLabels[s];
  const colors = HomeworkStatusColors[s];

  return {
    label,
    text: label,
    bg: colors.bg,
    color: colors.text,
    style: {
      backgroundColor: colors.bg,
      color: colors.text,
    },
  };
}
