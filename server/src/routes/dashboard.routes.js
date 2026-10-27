import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/requireAuth.js";
import StudySession from "../models/StudySession.js";
import Subject from "../models/Subject.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

const router = Router();
router.use(requireAuth);

function currentUtcWeek() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end, now };
}

router.get("/summary", async (request, response) => {
  const { start, end, now } = currentUtcWeek();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const [user, dueSoon, completedTasks, weeklySessions, upcomingTasks, recentSessions] = await Promise.all([
    User.findById(request.userId).select("name preferences timezone"),
    Task.countDocuments({ userId: request.userId, status: { $ne: "completed" }, dueAt: { $gte: now, $lte: sevenDays } }),
    Task.countDocuments({ userId: request.userId, status: "completed" }),
    StudySession.aggregate([
      { $match: { userId: userId(request.userId), startedAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, minutes: { $sum: "$durationMinutes" } } },
    ]),
    Task.find({ userId: request.userId, status: { $ne: "completed" }, dueAt: { $gte: now, $lte: sevenDays } })
      .sort({ dueAt: 1 }).limit(7).populate("subjectId", "name color"),
    StudySession.find({ userId: request.userId }).sort({ startedAt: -1 }).limit(5)
      .populate("subjectId", "name color").populate("taskId", "title"),
  ]);
  response.json({
    success: true,
    data: {
      user: user ? { name: user.name, preferences: user.preferences, timezone: user.timezone } : null,
      dueSoon,
      completedTasks,
      focusMinutesThisWeek: weeklySessions[0]?.minutes ?? 0,
      weeklyGoalMinutes: user?.preferences.weeklyGoalMinutes ?? 600,
      upcomingTasks,
      recentSessions,
      weekStartsAt: start.toISOString(),
      weekEndsAt: end.toISOString(),
    },
  });
});

router.get("/study-time", async (request, response) => {
  const { start, end } = currentUtcWeek();
  const rows = await StudySession.aggregate([
    { $match: { userId: userId(request.userId), startedAt: { $gte: start, $lt: end } } },
    { $group: { _id: { $dateToString: { date: "$startedAt", format: "%Y-%m-%d", timezone: "UTC" } }, minutes: { $sum: "$durationMinutes" } } },
  ]);
  const totals = new Map(rows.map(({ _id, minutes }) => [_id, minutes]));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return { date: key, minutes: totals.get(key) ?? 0 };
  });
  response.json({ success: true, data: { weekStartsAt: start.toISOString(), days } });
});

function userId(value) {
  return new mongoose.Types.ObjectId(value);
}

export default router;