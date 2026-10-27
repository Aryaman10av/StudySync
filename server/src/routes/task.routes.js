import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { idSchema, taskCreateSchema, taskQuerySchema, taskUpdateSchema } from "../validators/schemas.js";
import Subject from "../models/Subject.js";
import Task from "../models/Task.js";
import HttpError from "../utils/HttpError.js";

const router = Router();
const priorityRank = { high: 0, medium: 1, low: 2 };
router.use(requireAuth);

async function assertOwnedSubject(userId, subjectId) {
  if (!subjectId) return;
  const subject = await Subject.exists({ _id: subjectId, userId });
  if (!subject) throw new HttpError(400, "INVALID_SUBJECT", "Choose a subject that belongs to your account.");
}

router.get("/", validateQuery(taskQuerySchema), async (request, response) => {
  const query = request.validatedQuery;
  const filter = { userId: request.userId };
  for (const key of ["status", "priority", "type", "subjectId"]) {
    if (query[key] !== undefined) filter[key] = query[key];
  }
  if (query.from || query.to) {
    filter.dueAt = {};
    if (query.from) filter.dueAt.$gte = query.from;
    if (query.to) filter.dueAt.$lte = query.to;
  }
  if (query.q) filter.title = { $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };

  const direction = query.order === "asc" ? 1 : -1;
  const sortBy = query.sort === "priority" ? "_priorityRank" : query.sort;
  const offset = (query.page - 1) * query.limit;
  const aggregateFilter = { ...filter, userId: new mongoose.Types.ObjectId(request.userId) };
  if (query.subjectId) aggregateFilter.subjectId = new mongoose.Types.ObjectId(query.subjectId);
  const [tasks, total] = await Promise.all([
    Task.aggregate([
      { $match: aggregateFilter },
      {
        $addFields: {
          _priorityRank: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "high"] }, then: 0 },
                { case: { $eq: ["$priority", "medium"] }, then: 1 },
              ],
              default: 2,
            },
          },
        },
      },
      { $sort: { [sortBy]: direction, _id: 1 } },
      { $skip: offset },
      { $limit: query.limit },
      { $lookup: { from: Subject.collection.name, localField: "subjectId", foreignField: "_id", as: "subject" } },
      { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },
      { $project: { _priorityRank: 0 } },
    ]),
    Task.countDocuments(filter),
  ]);
  response.json({ success: true, data: tasks, meta: { page: query.page, limit: query.limit, total } });
});

router.post("/", validateBody(taskCreateSchema), async (request, response) => {
  await assertOwnedSubject(request.userId, request.body.subjectId);
  const taskData = { ...request.body, userId: request.userId };
  if (taskData.status === "completed") taskData.completedAt = new Date();
  const task = await Task.create(taskData);
  response.status(201).json({ success: true, data: task });
});

router.get("/:id", async (request, response) => {
  const id = idSchema.parse(request.params.id);
  const task = await Task.findOne({ _id: id, userId: request.userId }).populate("subjectId", "name color");
  if (!task) throw new HttpError(404, "NOT_FOUND", "Task not found.");
  response.json({ success: true, data: task });
});

router.patch("/:id", validateBody(taskUpdateSchema), async (request, response) => {
  const id = idSchema.parse(request.params.id);
  const update = { ...request.body };
  if (Object.hasOwn(update, "subjectId")) await assertOwnedSubject(request.userId, update.subjectId);
  if (update.status === "completed") update.completedAt = new Date();
  else if (update.status) update.completedAt = null;
  const task = await Task.findOneAndUpdate(
    { _id: id, userId: request.userId },
    { $set: update },
    { new: true, runValidators: true },
  ).populate("subjectId", "name color");
  if (!task) throw new HttpError(404, "NOT_FOUND", "Task not found.");
  response.json({ success: true, data: task });
});

router.delete("/:id", async (request, response) => {
  const id = idSchema.parse(request.params.id);
  const task = await Task.findOneAndDelete({ _id: id, userId: request.userId });
  if (!task) throw new HttpError(404, "NOT_FOUND", "Task not found.");
  response.json({ success: true, data: { deleted: true } });
});

export { priorityRank };
export default router;