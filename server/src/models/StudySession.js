import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, required: true },
  durationMinutes: { type: Number, required: true, min: 1, max: 720 },
  note: { type: String, trim: true, maxlength: 500, default: "" },
  mode: { type: String, enum: ["focus", "manual"], default: "focus" },
}, { timestamps: true });

studySessionSchema.index({ userId: 1, startedAt: -1 });

export default mongoose.model("StudySession", studySessionSchema);