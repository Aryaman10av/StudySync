import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 2000, default: "" },
  type: { type: String, enum: ["assignment", "exam", "revision", "other"], default: "assignment" },
  status: { type: String, enum: ["todo", "in_progress", "completed"], default: "todo" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  dueAt: { type: Date, default: null },
  estimatedMinutes: { type: Number, min: 1, max: 10080, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

taskSchema.index({ userId: 1, dueAt: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, subjectId: 1 });

export default mongoose.model("Task", taskSchema);