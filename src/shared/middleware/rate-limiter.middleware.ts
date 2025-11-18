import { Injectable, NestMiddleware } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private readonly limiter;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined');
    }
    const redisClient = new Redis(redisUrl);

    this.limiter = rateLimit({
      windowMs: 60 * 1000, // 1 menit
      max: 60, // 60 request per user/IP per menit
      standardHeaders: true,
      legacyHeaders: false,

      store: new RedisStore({
        sendCommand: (...args: string[]) => {
          if (args.length === 0) {
            throw new Error('sendCommand called with no arguments');
          }

          const [command, ...rest] = args;
          return redisClient.call(command, ...rest) as unknown as Promise<any>;
        },
      }),
      keyGenerator: (req: Request): string => {
        // jika user sudah login, pakai userId agar lebih akurat
        if (req.user?.userId) {
          return `user:${req.user.userId}`;
        }

        return req.ip || req.socket.remoteAddress || 'unknown';
      },

      handler: (req: Request, res: Response) => {
        return res.status(429).json({
          statusCode: 429,
          message: 'Too many requests, please slow down.',
        });
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}
