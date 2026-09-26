import { SetMetadata } from '@nestjs/common';

export type UserRole = 'master' | 'cliente';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
