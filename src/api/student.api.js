// src/api/student.api.js
import { API } from "./axios";

// Student self
export const getMe = async () => {
  const res = await API.get("/students/me");
  return res.data;
};

export const updateMe = async (payload) => {
  const res = await API.patch("/students/me", payload);
  return res.data;
};

// Admin student actions
export const getAllStudents = async () => {
  const res = await API.get("/students/list");
  return res.data;
};

export const getStudent = async (id) => {
  const res = await API.get(`/students/${id}`);
  return res.data;
};

export const updateStudent = async (id, payload) => {
  const res = await API.patch(`/students/update/${id}`, payload);
  return res.data;
};

export const uploadStudentPhoto = async (id, payload) => {
  const res = await API.patch(`/students/${id}/photo`, payload);
  return res.data;
};

export const deleteStudent = async (id) => {
  const res = await API.delete(`/students/delete/${id}`);
  return res.data;
};

export const getStudentExamReport = async (studentId, params = {}) => {
  const res = await API.get(`/exam-results/student/${studentId}/report`, { params });
  return res.data;
};

export const downloadStudentExamReportPDF = async (studentId, params = {}) => {
  const res = await API.get(`/exam-results/student/${studentId}/report/pdf`, {
    params,
    responseType: "blob"
  });
  return res.data;
};

export const saveStudentExamReport = async (studentId, payload = {}) => {
  const res = await API.post(`/exam-results/student/${studentId}/report/save`, payload);
  return res.data;
};


