import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/config/db.js";
import User from "../src/models/User.js";
import Subject from "../src/models/Subject.js";
import Task from "../src/models/Task.js";
import StudySession from "../src/models/StudySession.js";

const demoEmail = "demo@studysync.local";
const demoPassword = "StudySync123!";

try {
  await connectToDatabase();
  let user = await User.findOne({ email: demoEmail });
  if (!user) {
    user = await User.create({
      name: "Alex Morgan",
      email: demoEmail,
      passwordHash: await bcrypt.hash(demoPassword, 12),
      timezone: "UTC",
    });
  }

  const subjectSeeds = [
    { name: "Biology", color: "#43856a", description: "Cell biology and lab work" },
    { name: "World History", color: "#d66b50", description: "Modern history and primary sources" },
    { name: "Statistics", color: "#345bdb", description: "Probability and data analysis" },
  ];
  const subjects = {};
  for (const data of subjectSeeds) {
    subjects[data.name] = await Subject.findOneAndUpdate(
      { userId: user._id, name: data.name },
      { $setOnInsert: { ...data, userId: user._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const now = new Date();
  const taskSeeds = [
    { title: "Cell structure review", subjectId: subjects.Biology._id, dueAt: new Date(now.getTime() + 2 * 86400000), priority: "high", type: "assignment" },
    { title: "Read chapter 8", subjectId: subjects["World History"]._id, dueAt: new Date(now.getTime() + 4 * 86400000), priority: "medium", type: "revision" },
    { title: "Statistics midterm", subjectId: subjects.Statistics._id, dueAt: new Date(now.getTime() + 6 * 86400000), priority: "high", type: "exam" },
    { title: "Outline lab report", subjectId: subjects.Biology._id, status: "completed", completedAt: new Date(now.getTime() - 86400000), priority: "low", type: "assignment" },
  ];
  for (const data of taskSeeds) {
    await Task.updateOne({ userId: user._id, title: data.title }, { $setOnInsert: { ...data, userId: user._id } }, { upsert: true });
  }

  for (const [index, minutes] of [35, 25, 45].entries()) {
    const startedAt = new Date(now.getTime() - (index + 1) * 86400000 - minutes * 60000);
    const endedAt = new Date(startedAt.getTime() + minutes * 60000);
    await StudySession.updateOne(
      { userId: user._id, note: `Seeded focus session ${index + 1}` },
      { $setOnInsert: { userId: user._id, subjectId: subjects.Biology._id, startedAt, endedAt, durationMinutes: minutes, note: `Seeded focus session ${index + 1}`, mode: "focus" } },
      { upsert: true },
    );
  }

  console.log(`Seed data ready for ${demoEmail}. Demo password: ${demoPassword}`);
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}