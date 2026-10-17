import { z } from "zod";

export const THREAD_NOT_FOUND = "Thread not found";

/** Trims whitespace and enforces a 1..120 character title. */
export const threadTitleSchema = z
  .string()
  .transform((t) => t.trim())
  .pipe(z.string().min(1).max(120));

/**
 * Returns the row when an ownership-scoped mutation affected a thread,
 * otherwise throws a generic not-found error that does not reveal
 * whether the ID exists but belongs to someone else.
 */
export function requireThreadRow<T>(row: T | null): T {
  if (!row) throw new Error(THREAD_NOT_FOUND);
  return row;
}
