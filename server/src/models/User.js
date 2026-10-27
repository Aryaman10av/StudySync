import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  timezone: { type: String, default: "UTC", maxlength: 100 },
  preferences: {
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    weeklyGoalMinutes: { type: Number, min: 0, max: 10080, default: 600 },
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);