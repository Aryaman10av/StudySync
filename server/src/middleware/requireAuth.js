import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";

export async function requireAuth(request, response, next) {
  const token = request.cookies[env.cookieName];
  if (!token) {
    return response.status(401).json({
      success: false,
      error: { code: "UNAUTHENTICATED", message: "Please sign in to continue." },
    });
  }

  let payload;
  try { payload = jwt.verify(token, env.jwtSecret); }
  catch {
    return response.status(401).json({
      success: false,
      error: { code: "UNAUTHENTICATED", message: "Your session has expired. Please sign in again." },
    });
  }

  if (!await User.exists({ _id: payload.sub })) {
    return response.status(401).json({ success: false, error: { code: "UNAUTHENTICATED", message: "Please sign in again." } });
  }
  request.userId = payload.sub;
  next();
}