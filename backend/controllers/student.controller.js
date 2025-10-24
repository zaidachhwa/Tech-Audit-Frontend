import bcrypt from "bcryptjs";
import { Student } from "../model/student.model.js";
import Batch from "../model/batch.model.js";
import jwt from "jsonwebtoken";

export const registerStudent = async (req, res) => {
  const { name, email, password, batch_name, batch_no } = req.body;

  if (!name || !email || !password || !batch_name || !batch_no) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      batch_name,
      batch_no,
    });

    // Find batch by both name & number
    const batch = await Batch.findOne({ batch_name, batch_no });

    // ✅ If batch exists, push student
    if (batch) {
      if (!batch.students.includes(student._id)) {
        batch.students.push(student._id);
        await batch.save();
      }
    }

    // Generate token
    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Student registered successfully",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        batch_name,
        batch_no,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error?.message });
  }
};

export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password)
    return res
      .status(400)
      .json({ message: "Email and Password are required field." });
  try {
    const student = await Student.findOne({ email: email });

    if (!student) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    const matchedPassword = await bcrypt.compare(password, student.password);

    if (!matchedPassword) {
      return res.status(400).json({ message: "Invalid Password." });
    }

    const token = jwt.sign(
      {
        id: student._id,
        role: "student",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "LoggedIn successfully.",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        batch_name: student.batch_name,
        batch_no: student.batch_no,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error?.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.status(200).json({ students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Remove from batch if exists
    await Batch.updateOne(
      { batch_name: student.batch_name, batch_no: student.batch_no },
      { $pull: { students: student._id } }
    );

    await Student.findByIdAndDelete(id);

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
