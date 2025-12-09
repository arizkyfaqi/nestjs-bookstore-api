import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from 'src/shared/redis/redis.service';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(
      'cache_key',
      context.getHandler(),
    );

    const decoratorTtl = this.reflector.get<number>(
      'cache_ttl',
      context.getHandler(),
    );

    const envTtl = process.env.CACHE_TTL ? Number(process.env.CACHE_TTL) : null;

    const cacheTtl = decoratorTtl ?? envTtl ?? 300;

    if (!cacheKey) {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest();
    const key = `${cacheKey}-${request.user.role}-${request.originalUrl}`;
    try {
      const cachedData = await this.redisService.get(key);
      this.logger.log(`Cache get : ${key}`);
      if (cachedData) {
        return of(JSON.parse(cachedData));
      }
    } catch (error) {
      this.logger.log('Cache get error: ', error);
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          await this.redisService.set(key, JSON.stringify(data), cacheTtl);
          this.logger.log(`Cache set: ${key} (ttl: ${cacheTtl}s)`);
        } catch (error) {
          this.logger.log('Cache set error:', error);
        }
      }),
    );
  }
}
