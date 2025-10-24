import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  point1: { type: String, required: true },
  point2: { type: String, required: true },
  point3: { type: String, required: true },
});

const parameterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  // feedback: { type: feedbackSchema, required: true },
});

const reportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    parameters: [parameterSchema],
    feedbackSchema: [feedbackSchema],
    overallRemarks: { type: String },
    auditDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("report", reportSchema);
