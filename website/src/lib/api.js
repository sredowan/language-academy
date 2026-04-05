/**
 * Returns the internal API base URL for server-side fetches.
 * In production, the API runs on the same process, so we use localhost.
 * In development, it goes through the gateway on port 3000.
 */
export function getApiBase() {
  return process.env.INTERNAL_API_URL || 'http://localhost:3000';
}
