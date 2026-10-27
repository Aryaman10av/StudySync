import assert from "node:assert/strict";
import test from "node:test";
import { registerSchema, taskCreateSchema } from "../src/validators/schemas.js";
import User from "../src/models/User.js";

test("registration normalizes email addresses", () => {
  const result = registerSchema.safeParse({
    name: "Alex Morgan",
    email: "ALEX@example.com",
    password: "studyplan123",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.email, "alex@example.com");
});

test("task input rejects owner ID mass assignment", () => {
  const result = taskCreateSchema.safeParse({
    title: "Read chapter",
    userId: "0123456789abcdef01234567",
  });

  assert.equal(result.success, false);
});

test("task input rejects invalid dates", () => {
  const result = taskCreateSchema.safeParse({ title: "Read chapter", dueAt: "not-a-date" });
  assert.equal(result.success, false);
});

test("user schema provides expected preference defaults", () => {
  const user = new User({ name: "Alex Morgan", email: "alex@example.com", passwordHash: "hash" });
  assert.equal(user.preferences.theme, "system");
  assert.equal(user.preferences.weeklyGoalMinutes, 600);
});

test("task input preserves an empty due date as null", () => {
  const result = taskCreateSchema.safeParse({ title: "Read chapter", dueAt: null });
  assert.equal(result.success, true);
  assert.equal(result.data.dueAt, null);
});