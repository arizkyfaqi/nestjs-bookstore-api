import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinstonLoggerService } from 'src/shared/logger/logger-winston.service';
import { ErrorLog } from 'src/shared/logger/error-log.entity';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly winstonLogger: WinstonLoggerService,
    @InjectRepository(ErrorLog)
    private readonly errorLogRepository: Repository<ErrorLog>,
  ) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception.message || 'Internal server error';

    // Log to file / console using winston
    this.winstonLogger.error(message, {
      status,
      stack: exception.stack,
      method: request.method,
    });

    // Save to DB (fire and forget)
    await this.errorLogRepository.save({
      message,
      stack: exception.stack,
      status,
      context: request.url,
    });

    // Response JSON standard
    return response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
