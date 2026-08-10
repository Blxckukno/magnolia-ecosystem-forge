const GENERIC_MESSAGE = "An internal error occurred. Please try again.";

/** Logs the detailed database error server-side and throws a safe, generic error. */
export function throwGenericDbError(scope: string, error: { message: string }): never {
  console.error(`[assistant] ${scope} DB error:`, error.message);
  throw new Error(GENERIC_MESSAGE);
}
