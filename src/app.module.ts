import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { CartModule } from './cart/cart.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UploadsModule } from './uploads/uploads.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import environtmentValidation from './config/environtment.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { RedisModule } from './shared/redis/redis.module';
import { RateLimiterMiddleware } from './shared/middleware/rate-limiter.middleware';
import { ErrorLog } from './shared/logger/error-log.entity';
import { WinstonLoggerService } from './shared/logger/logger-winston.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    UsersModule,
    AuthModule,
    BooksModule,
    CartModule,
    TransactionsModule,
    UploadsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: ['.env.development'],
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig],
      validationSchema: environtmentValidation,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configServices: ConfigService) => ({
        type: 'postgres',
        logging: true,
        // entities: [User],
        autoLoadEntities: configServices.get('database.autoLoadEntities'),
        synchronize: configServices.get('database.synchronize'),
        port: +configServices.get('database.port'),
        username: configServices.get('database.user'),
        password: configServices.get<string>('database.password'),
        host: configServices.get('database.host'),
        database: configServices.get('database.name'),
      }),
    }),

    RedisModule,
    TypeOrmModule.forFeature([ErrorLog]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WinstonLoggerService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimiterMiddleware).forRoutes('*'); // global
  }
}
