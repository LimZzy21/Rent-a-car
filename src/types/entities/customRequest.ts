import { User } from "@prisma/client";

export interface CustomRequest extends Request {
  user: User;
}

