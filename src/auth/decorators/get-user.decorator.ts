import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If data is provided (e.g., @GetUser('id')), return that specific property
    if (data) {
      return user[data];
    }

    // Otherwise return the entire user object
    return user;
  },
); 