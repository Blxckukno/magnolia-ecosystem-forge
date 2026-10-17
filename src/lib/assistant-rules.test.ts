import { test } from "node:test";
import assert from "node:assert/strict";
import { threadTitleSchema, requireThreadRow, THREAD_NOT_FOUND } from "./assistant-rules";

test("title schema trims whitespace", () => {
  assert.equal(threadTitleSchema.parse("  hello  "), "hello");
});

test("title schema rejects empty or whitespace-only titles", () => {
  assert.throws(() => threadTitleSchema.parse(""));
  assert.throws(() => threadTitleSchema.parse("   "));
});

test("title schema rejects titles over 120 chars after trim", () => {
  assert.throws(() => threadTitleSchema.parse("x".repeat(121)));
  assert.equal(threadTitleSchema.parse("x".repeat(120)).length, 120);
});

test("requireThreadRow returns the row when present", () => {
  const row = { id: "abc" };
  assert.equal(requireThreadRow(row), row);
});

test("requireThreadRow throws generic not-found for null (zero affected rows)", () => {
  assert.throws(() => requireThreadRow(null), new Error(THREAD_NOT_FOUND));
});
