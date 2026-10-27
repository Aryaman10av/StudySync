import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { idSchema, sessionCreateSchema, sessionQuerySchema } from "../validators/schemas.js";
import StudySession from "../models/StudySession.js";
import Subject from "../models/Subject.js";
import Task from "../models/Task.js";
import HttpError from "../utils/HttpError.js";

const router = Router();
router.use(requireAuth);

router.get("/", validateQuery(sessionQuerySchema), async (request, response) => {
  const { from, to, page, limit } = request.validatedQuery;
  const filter = { userId: request.userId };
  if (from || to) {
    filter.startedAt = {};
    if (from) filter.startedAt.$gte = from;
    if (to) filter.startedAt.$lte = to;
  }
  const [sessions, total] = await Promise.all([
    StudySession.find(filter).sort({ startedAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate("subjectId", "name color").populate("taskId", "title"),
    StudySession.countDocuments(filter),
  ]);
  response.json({ success: true, data: sessions, meta: { page, limit, total } });
});

router.post("/", validateBody(sessionCreateSchema), async (request, response) => {
  const { subjectId, taskId, startedAt, endedAt, durationMinutes, note, mode } = request.body;
  if (endedAt <= startedAt || startedAt.getTime() > Date.now() + 60_000 || endedAt.getTime() > Date.now() + 60_000) {
    throw new HttpError(400, "INVALID_SESSION_TIME", "Session end must be after its start and cannot be in the future.");
  }
  const wallMinutes = Math.floor((endedAt.getTime() - startedAt.getTime()) / 60_000);
  if (wallMinutes < 1 || wallMinutes > 720) {
    throw new HttpError(400, "INVALID_SESSION_DURATION", "A study session must last between 1 minute and 12 hours.");
  }
  if (mode === "focus" && durationMinutes !== undefined && durationMinutes > wallMinutes) {
    throw new HttpError(400, "INVALID_SESSION_DURATION", "Focused minutes cannot exceed the session time interval.");
  }
  if (mode === "manual" && durationMinutes !== undefined && Math.abs(durationMinutes - wallMinutes) > 1) {
    throw new HttpError(400, "INVALID_SESSION_DURATION", "The supplied duration does not match the session timestamps.");
  }
  const derivedMinutes = mode === "focus" ? durationMinutes ?? wallMinutes : wallMinutes;
  if (subjectId && !await Subject.exists({ _id: subjectId, userId: request.userId })) {
    throw new HttpError(400, "INVALID_SUBJECT", "Choose a subject that belongs to your account.");
  }
  if (taskId) {
    const task = await Task.findOne({ _id: taskId, userId: request.userId }).select("subjectId");
    if (!task) throw new HttpError(400, "INVALID_TASK", "Choose a task that belongs to your account.");
    if (subjectId && task.subjectId && String(task.subjectId) !== String(subjectId)) {
      throw new HttpError(400, "SESSION_REFERENCE_MISMATCH", "The selected task belongs to a different subject.");
    }
  }

  const session = await StudySession.create({
    userId: request.userId,
    subjectId: subjectId ?? null,
    taskId: taskId ?? null,
    startedAt,
    endedAt,
    durationMinutes: derivedMinutes,
    note,
    mode,
  });
  response.status(201).json({ success: true, data: session });
});

router.get("/:id", async (request, response) => {
  const id = idSchema.parse(request.params.id);
  const session = await StudySession.findOne({ _id: id, userId: request.userId })
    .populate("subjectId", "name color").populate("taskId", "title");
  if (!session) throw new HttpError(404, "NOT_FOUND", "Study session not found.");
  response.json({ success: true, data: session });
});

router.delete("/:id", async (request, response) => {
  const id = idSchema.parse(request.params.id);
  const session = await StudySession.findOneAndDelete({ _id: id, userId: request.userId });
  if (!session) throw new HttpError(404, "NOT_FOUND", "Study session not found.");
  response.json({ success: true, data: { deleted: true } });
});

export default router;