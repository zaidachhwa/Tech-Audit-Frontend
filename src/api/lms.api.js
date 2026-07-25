import { API } from "./axios";

// ─── Admin / Teacher ──────────────────────────────────────────────────────────

/**
 * Upload a new LMS resource (multipart/form-data).
 * @param {FormData} formData  – must contain: file, title, visibility, [batches], [description]
 * @param {function} onProgress – (percent: number) => void
 */
export const uploadLmsResource = (formData, onProgress) =>
  API.post("/lms/upload", formData, {
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  }).then((r) => r.data);

/** Get all LMS resources with pagination */
export const getAllLmsResources = (page = 1, limit = 20) =>
  API.get("/lms", { params: { page, limit } }).then((r) => r.data);

/** Update LMS resource metadata */
export const updateLmsResource = (id, data) =>
  API.put(`/lms/${id}`, data).then((r) => r.data);

/** Delete an LMS resource */
export const deleteLmsResource = (id) =>
  API.delete(`/lms/${id}`).then((r) => r.data);

// ─── Student ──────────────────────────────────────────────────────────────────

/** Get LMS resources the student can access */
export const getStudentLmsResources = (page = 1, limit = 20) =>
  API.get("/lms/my", { params: { page, limit } }).then((r) => r.data);
