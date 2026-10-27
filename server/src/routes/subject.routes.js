import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";
import { idSchema, subjectCreateSchema, subjectUpdateSchema } from "../validators/schemas.js";
import StudySession from "../models/StudySession.js";
import Subject from "../models/Subject.js";
import Task from "../models/Task.js";
import HttpError from "../utils/HttpError.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (request, response) => {
  const filter = { userId: request.userId };
  if (request.query.includeArchived !== "true") filter.archived = false;
  const subjects = await Subject.find(filter).sort({ name: 1 });
  response.json({ success: true, data: subjects });
});

router.post("/", validateBody(subjectCreateSchema), async (request, response) => {
  const subject = await Subject.create({ ...request.body, userId: request.userId });
  response.status(201).json({ success: true, data: subject });
});

router.get("/:id", async (request, response) => {
  const id = idSchema.parse(request.params.id);
  const subject = await Subject.findOne({ _id: id, userId: request.userId });
  if (!subject) throw new HttpError(404, "NOT_FOUND", "Subject not found.");
  response.json({ success: true, data: subject });
});

router.patch("/:id", validateBody(subjectUpdateSchema), async (request, response) => {
  const id = idSchema.parse(request.params.id);
  const subject = await Subject.findOneAndUpdate(
    { _id: id, userId: request.userId },
    { $set: request.body },
    { new: true, runValidators: true },
  );
  if (!subject) throw new HttpError(404, "NOT_FOUND", "Subject not found.");
  response.json({ success: true, data: subject });
});

router.delete("/:id", async (request, response) => {
  const id = idSchema.parse(request.params.id);
  const subject = await Subject.findOne({ _id: id, userId: request.userId });
  if (!subject) throw new HttpError(404, "NOT_FOUND", "Subject not found.");
  const [taskCount, sessionCount] = await Promise.all([
    Task.countDocuments({ userId: request.userId, subjectId: id }),
    StudySession.countDocuments({ userId: request.userId, subjectId: id }),
  ]);
  if (taskCount || sessionCount) throw new HttpError(409, "SUBJECT_IN_USE", "Archive this subject instead; it has linked tasks or study sessions.");
  await subject.deleteOne();
  response.json({ success: true, data: { deleted: true } });
});

export default router;