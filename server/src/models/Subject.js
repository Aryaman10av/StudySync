import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
  color: { type: String, default: "#345bdb", match: /^#[0-9a-fA-F]{6}$/ },
  description: { type: String, trim: true, maxlength: 300, default: "" },
  archived: { type: Boolean, default: false },
}, { timestamps: true });

subjectSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("Subject", subjectSchema);