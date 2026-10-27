import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import app from "../src/app.js";

test("health is available while MongoDB is disconnected", async (context) => {
  const server = app.listen(0);
  await once(server, "listening");
  context.after(() => server.close());
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const healthResponse = await fetch(`${baseUrl}/api/v1/health`);
  const health = await healthResponse.json();
  assert.equal(healthResponse.status, 200);
  assert.equal(health.data.database, "disconnected");

  const tasksResponse = await fetch(`${baseUrl}/api/v1/tasks`);
  const tasks = await tasksResponse.json();
  assert.equal(tasksResponse.status, 503);
  assert.equal(tasks.error.code, "DATABASE_UNAVAILABLE");
});