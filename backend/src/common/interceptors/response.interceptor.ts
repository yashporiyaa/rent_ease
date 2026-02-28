import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
} & Record<string, unknown>;

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const responseData =
          typeof data === 'object' && data !== null
            ? (data as Record<string, unknown>)
            : null;
        const messageValue = responseData?.message;

        if (responseData && 'data' in responseData) {
          const payload = responseData.data as T;
          const rest: Record<string, unknown> = { ...responseData };
          delete rest.message;
          delete rest.data;

          return {
            success: true,
            message:
              typeof messageValue === 'string'
                ? messageValue
                : 'Request successful',
            data: payload,
            ...rest,
          };
        }

        return {
          success: true,
          message:
            typeof messageValue === 'string'
              ? messageValue
              : 'Request successful',
          data,
        };
      }),
    );
  }
}
