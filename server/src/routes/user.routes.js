import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validate.js";
import { profileUpdateSchema } from "../validators/schemas.js";

const router = Router();

function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email, timezone: user.timezone, preferences: user.preferences };
}

router.use(requireAuth);

router.get("/me", async (request, response) => {
  const user = await User.findById(request.userId);
  response.json({ success: true, data: { user: safeUser(user) } });
});

router.patch("/me", validateBody(profileUpdateSchema), async (request, response) => {
  const allowed = request.body;
  const updates = {};
  if (allowed.name !== undefined) updates.name = allowed.name;
  if (allowed.timezone !== undefined) updates.timezone = allowed.timezone;
  for (const [key, value] of Object.entries(allowed.preferences ?? {})) updates[`preferences.${key}`] = value;
  const user = await User.findByIdAndUpdate(request.userId, { $set: updates }, { new: true, runValidators: true });
  response.json({ success: true, data: { user: safeUser(user) } });
});

export default router;