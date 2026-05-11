// services/user.service.ts

import { User, CreateUserDto, UpdateUserDto, UserId } from '../types/user.types';
import { logger } from '../utils/logger';
import { validateEmail, validateNonEmpty, combineValidations } from '../utils/validator';

const users = new Map<UserId, User>();

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export function createUser(dto: CreateUserDto): User {
  const errors = combineValidations([
    validateNonEmpty(dto.email, 'email'),
    validateEmail(dto.email) ? null : 'email format is invalid',
    validateNonEmpty(dto.name, 'name'),
  ]);
  if (!errors.valid) throw new Error(`Validation failed: ${errors.errors.join(', ')}`);

  const existing = Array.from(users.values()).find(u => u.email === dto.email);
  if (existing) throw new Error(`User with email ${dto.email} already exists`);

  const user: User = {
    id: generateId(),
    email: dto.email,
    name: dto.name,
    role: dto.role ?? 'member',
    createdAt: new Date(),
    active: true,
  };
  users.set(user.id, user);
  logger.info('User created', { userId: user.id });
  return user;
}

export function getUserById(id: UserId): User | undefined {
  return users.get(id);
}

export function getAllUsers(): User[] {
  return Array.from(users.values());
}

export function updateUser(id: UserId, dto: UpdateUserDto): User {
  const user = users.get(id);
  if (!user) throw new Error(`User ${id} not found`);
  const updated: User = { ...user, ...dto };
  users.set(id, updated);
  logger.info('User updated', { userId: id });
  return updated;
}

export function deleteUser(id: UserId): boolean {
  const existed = users.has(id);
  users.delete(id);
  if (existed) logger.info('User deleted', { userId: id });
  return existed;
}

export function clearUsers(): void {
  users.clear();
}
