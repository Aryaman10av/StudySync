import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { isDatabaseReady } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { requireDatabase } from "./middleware/requireDatabase.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import taskRoutes from "./routes/task.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/v1/health", (_request, response) => {
  response.json({
    success: true,
    data: { status: "ok", database: isDatabaseReady() ? "connected" : "disconnected" },
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", requireDatabase);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;