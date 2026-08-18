/**
 * In-memory sliding-window limiter mirroring Laravel's RateLimiter usage in
 * Admin\AuthController (5 attempts, 5 minute decay, keyed by username+ip).
 * Only correct on a single long-lived Node process (Railway), not serverless.
 */
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

const attempts = new Map<string, { count: number; resetAt: number }>();
let lastSweep = Date.now();

// Expired entries (e.g. from usernames that never come back) would otherwise
// sit in the map forever — an attacker hitting many distinct username/IP
// pairs could grow it unboundedly. Sweep lazily on access instead of a timer,
// so this stays serverless-safe too.
function sweepExpired(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, entry] of attempts) {
    if (entry.resetAt < now) attempts.delete(key);
  }
}

export function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  sweepExpired(now);
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) return false;
  return entry.count >= MAX_ATTEMPTS;
}

export function hit(key: string): void {
  const now = Date.now();
  sweepExpired(now);
  const entry = attempts.get(key);
  const count = entry && entry.resetAt >= now ? entry.count + 1 : 1;
  attempts.set(key, { count, resetAt: now + LOCKOUT_MS });
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}
