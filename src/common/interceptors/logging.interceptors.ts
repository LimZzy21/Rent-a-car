import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const { method, url, ip } = req;
    const userAgentHeader = req.get('User-Agent') || '';
    const now = Date.now();

    this.logger.log(
      `Starting ${method} ${url} from ${ip} - ${userAgentHeader}`,
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log(
          `Completed ${method} ${url} ${res.statusCode} - ${duration}ms`,
        );
      }),
      catchError((error: any) => {
        const duration = Date.now() - now;
        this.logger.error(
          `Failed ${method} ${url} - ${duration}ms`,
          error.stack,
        );
        return throwError(() => error as Error);
      }),
    );
  }
}
