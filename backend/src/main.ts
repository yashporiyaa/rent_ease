import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const configuredOrigins = (
    process.env.CORS_ORIGIN?.split(',') ?? [frontendUrl]
  )
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = Array.from(
    new Set([
      ...configuredOrigins,
      frontendUrl,
      'https://rent1ease1.netlify.app',
      'http://localhost:3000',
    ]),
  );

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Allow larger payloads for item creation with multiple base64 images.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl === '/stripe/webhook') {
      next(); // skip json parsing for webhook
    } else {
      json({ limit: '15mb' })(req, res, next);
    }
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl === '/stripe/webhook') {
      next();
    } else {
      urlencoded({ limit: '15mb', extended: true })(req, res, next);
    }
  });

  app.use(cookieParser());

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
