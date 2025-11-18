import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import Redis from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL is not defined');
  }
  const redisClient = new Redis(redisUrl);
  /*
   * Use validation pipes globaly
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  //create the swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nestjs Book Store API Documentation')
    .setDescription('Use the base API URL as http://localhost:3000')
    .setTermsOfService('http://localhost:3000/terms-of-service')
    .setLicense(
      'MIT License',
      'https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.txt',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .addServer('http://localhost:3000/')
    .setVersion('1.0')
    .build();
  //instantiate swagger
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  //enable cross
  app.enableCors();
  console.log('Running in NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.info(`Running on port ${port}`);
}
bootstrap();
