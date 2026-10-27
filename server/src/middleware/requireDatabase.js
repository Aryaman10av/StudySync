import { isDatabaseReady } from "../config/db.js";

export function requireDatabase(_request, response, next) {
  if (!isDatabaseReady()) {
    return response.status(503).json({
      success: false,
      error: { code: "DATABASE_UNAVAILABLE", message: "The database is not connected. Check MONGODB_URI and try again." },
    });
  }
  next();
}