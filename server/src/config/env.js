import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env") });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/studysync"),
  JWT_SECRET: z.string().min(32).default("development-only-secret-change-before-deploy"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  COOKIE_NAME: z.string().min(1).default("studysync_token"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid server environment:", z.prettifyError(parsed.error));
  process.exit(1);
}

if (parsed.data.NODE_ENV === "production" && parsed.data.JWT_SECRET === "development-only-secret-change-before-deploy") {
  throw new Error("JWT_SECRET must be set to a unique secret in production.");
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  clientOrigin: parsed.data.CLIENT_ORIGIN,
  mongoUri: parsed.data.MONGODB_URI,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  cookieName: parsed.data.COOKIE_NAME,
};