import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly details?: any,
  ) {
    super(message, status);
  }
} 