// controllers/user.controller.ts

import { CreateUserDto, UpdateUserDto, UserId } from '../types/user.types';
import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../services/user.service';
import { logger } from '../utils/logger';

export interface ControllerResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function handleCreateUser(dto: CreateUserDto): ControllerResult<ReturnType<typeof createUser>> {
  try {
    const user = createUser(dto);
    return { success: true, data: user };
  } catch (err) {
    logger.error('handleCreateUser failed', { error: String(err) });
    return { success: false, error: String(err) };
  }
}

export function handleGetUser(id: UserId): ControllerResult<ReturnType<typeof getUserById>> {
  const user = getUserById(id);
  if (!user) return { success: false, error: `User ${id} not found` };
  return { success: true, data: user };
}

export function handleListUsers(): ControllerResult<ReturnType<typeof getAllUsers>> {
  return { success: true, data: getAllUsers() };
}

export function handleUpdateUser(id: UserId, dto: UpdateUserDto): ControllerResult<ReturnType<typeof updateUser>> {
  try {
    const user = updateUser(id, dto);
    return { success: true, data: user };
  } catch (err) {
    logger.error('handleUpdateUser failed', { error: String(err) });
    return { success: false, error: String(err) };
  }
}

export function handleDeleteUser(id: UserId): ControllerResult<boolean> {
  try {
    const deleted = deleteUser(id);
    if (!deleted) return { success: false, error: `User ${id} not found` };
    return { success: true, data: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
