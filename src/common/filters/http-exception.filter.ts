import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GlobalErrors } from 'src/Constants/Errors/global';

interface ErrorDetails {
  validationErrors?: string[];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = GlobalErrors.INTERNAL_SERVER_ERROR;
    let validationError: ErrorDetails | undefined = undefined;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      message = typeof response === 'string' ? response : response['message'];

      if (exception instanceof BadRequestException) {
        const validationErrors = exception.getResponse()['message'];
        validationError = {
          validationErrors: Array.isArray(validationErrors)
            ? validationErrors
            : [validationErrors],
        };
        message = GlobalErrors.BAD_REQUEST;
      } else if (exception instanceof UnauthorizedException) {
        message = GlobalErrors.UNAUTHORIZED;
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      method: request.method,
      ...(validationError ? { validationError } : {}),
    };

    response.status(status).json(errorResponse);
  }
}
