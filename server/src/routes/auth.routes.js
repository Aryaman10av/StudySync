import { Router } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validators/schemas.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false });
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.nodeEnv === "production",
  path: "/",
};

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    timezone: user.timezone,
    preferences: user.preferences,
  };
}

function setSession(response, userId) {
  const token = jwt.sign({}, env.jwtSecret, { subject: String(userId), expiresIn: env.jwtExpiresIn });
  response.cookie(env.cookieName, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

router.post("/register", authLimiter, requireDatabase, validateBody(registerSchema), async (request, response) => {
  const { name, email, password } = request.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  setSession(response, user._id);
  response.status(201).json({ success: true, data: { user: safeUser(user) } });
});

router.post("/login", authLimiter, requireDatabase, validateBody(loginSchema), async (request, response) => {
  const user = await User.findOne({ email: request.body.email }).select("+passwordHash");
  const valid = user && await bcrypt.compare(request.body.password, user.passwordHash);
  if (!valid) {
    return response.status(401).json({
      success: false,
      error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." },
    });
  }
  setSession(response, user._id);
  response.json({ success: true, data: { user: safeUser(user) } });
});

router.post("/logout", (_request, response) => {
  response.clearCookie(env.cookieName, cookieOptions);
  response.json({ success: true, data: { loggedOut: true } });
});

router.get("/me", requireDatabase, requireAuth, async (request, response) => {
  const user = await User.findById(request.userId);
  if (!user) {
    response.clearCookie(env.cookieName, cookieOptions);
    return response.status(401).json({ success: false, error: { code: "UNAUTHENTICATED", message: "Please sign in again." } });
  }
  response.json({ success: true, data: { user: safeUser(user) } });
});

export default router;