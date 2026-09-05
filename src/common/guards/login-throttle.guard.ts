import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory per-instance limiter. Fine at v0 single-instance scale; revisit
// (e.g. move to Redis) once the app runs on more than one instance.
const attempts = new Map<string, Bucket>();

@Injectable()
export class LoginThrottleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Only enforced in production — repeated logins while developing/testing
    // shouldn't lock anyone out.
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const email = typeof request.body?.email === 'string' ? request.body.email.toLowerCase() : 'unknown';
    const key = `${request.ip}:${email}`;
    const now = Date.now();

    const bucket = attempts.get(key);
    if (!bucket || now > bucket.resetAt) {
      attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }

    if (bucket.count >= MAX_ATTEMPTS) {
      throw new HttpException('Too many login attempts. Try again in a minute.', HttpStatus.TOO_MANY_REQUESTS);
    }

    bucket.count += 1;
    return true;
  }
}
