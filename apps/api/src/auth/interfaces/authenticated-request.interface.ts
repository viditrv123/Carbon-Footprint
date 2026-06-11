import { Request } from 'express';
import { User } from '@prisma/client';

/**
 * Express request extended with the authenticated Prisma User,
 * injected by JwtStrategy.validate().
 */
export interface AuthenticatedRequest extends Request {
  user: User;
}
