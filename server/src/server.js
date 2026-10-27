import app from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";

const server = app.listen(env.port, () => {
  console.log(`StudySync API listening on port ${env.port}`);
});

connectToDatabase()
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error(`MongoDB connection failed: ${error.message}`));

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});