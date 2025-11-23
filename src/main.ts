import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import Redis from 'ioredis';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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

  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const urlServer =
    process.env.NODE_ENV === 'production'
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'nestjs-bookstore-api-production.up.railway.app'}/`
      : 'http://localhost:3000/';

  //create the swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nestjs Book Store API Documentation')
    .setDescription(`Use the base API URL as ${urlServer}`)
    .setTermsOfService(`${urlServer}terms-of-service`)
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
    .addServer(urlServer)
    .setVersion('1.0')
    .build();
  //instantiate swagger
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  //enable cross
  app.enableCors();
  console.log('Url :', urlServer);

  const port = Number(process.env.PORT) || 3000;
  const host = '0.0.0.0';
  await app.listen(port, host);
  console.log(`Application running on http://${host}:${port}`);
}
bootstrap();
