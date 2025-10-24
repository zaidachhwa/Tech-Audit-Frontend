import { Admin } from "../model/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//  Register Admin    /api/admin/register
export const RegisterAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required." });

  try {
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newAdmin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Admin created successfully",
      token,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error?.message });
  }
};

// Login Admin       /api/admin/login

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password)
    return res
      .status(400)
      .json({ message: "Email and Password are required field." });

  try {
    const admin = await Admin.findOne({ email: email });

    if (!admin) {
      return res.status(400).json({ message: "Invalid Email." });
    }

    const matchedPassword = await bcrypt.compare(password, admin.password);

    if (!matchedPassword) {
      return res.status(400).json({ message: "Invalid Password." });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "LoggedIn successfully.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error?.message });
  }
};
