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

export const updateStudent = async (id, payload) => {
  const res = await API.patch(`/students/update/${id}`, payload);
  return res.data;
};

export const deleteStudent = async (id) => {
  const res = await API.delete(`/students/delete/${id}`);
  return res.data;
};
