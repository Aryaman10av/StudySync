import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("bufferCommands", false);

export function connectToDatabase() {
  return mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
}

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}