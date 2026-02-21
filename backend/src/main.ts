import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Allow larger payloads for item creation with multiple base64 images.
  app.use((req, res, next) => {
    if (req.originalUrl === '/stripe/webhook') {
      next(); // skip json parsing for webhook
    } else {
      json({ limit: '15mb' })(req, res, next);
    }
  });

  app.use((req, res, next) => {
    if (req.originalUrl === '/stripe/webhook') {
      next();
    } else {
      urlencoded({ limit: '15mb', extended: true })(req, res, next);
    }
  });

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
