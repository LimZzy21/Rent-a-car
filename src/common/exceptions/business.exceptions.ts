import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { GlobalErrors } from 'src/Constants/Errors/global';

export class NotFoundException extends BaseException {
  constructor(message: string = GlobalErrors.NOT_FOUND, details?: any) {
    super(message, HttpStatus.NOT_FOUND, details);
  }
}
export class ValidationException extends BaseException {
  constructor(message: string = GlobalErrors.BAD_REQUEST, details?: any) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string = GlobalErrors.UNAUTHORIZED, details?: any) {
    super(message, HttpStatus.UNAUTHORIZED, details );
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string = GlobalErrors.FORBIDDEN, details?: any) {
    super(message, HttpStatus.FORBIDDEN, details);
  }
} 