import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type ExceptionResponseBody = {
  message?: string | string[];
};

type PayloadTooLargeLike = {
  type: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.headersSent) {
      return;
    }

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const maybeResponse = res as ExceptionResponseBody;
        if (typeof maybeResponse.message === 'string') {
          message = maybeResponse.message;
        } else if (
          Array.isArray(maybeResponse.message) &&
          maybeResponse.message.length > 0
        ) {
          message = maybeResponse.message.join(', ');
        }
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'type' in exception &&
      (exception as PayloadTooLargeLike).type === 'entity.too.large'
    ) {
      status = HttpStatus.PAYLOAD_TOO_LARGE;
      message = 'Request payload too large';
    }

    response.status(status).json({
      success: false,
      message,
      error: request.url,
    });
  }
}
