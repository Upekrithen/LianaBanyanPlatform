// types/user.types.ts

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'guest';
  createdAt: Date;
  active: boolean;
}

export interface CreateUserDto {
  email: string;
  name: string;
  role?: User['role'];
}

export interface UpdateUserDto {
  name?: string;
  role?: User['role'];
  active?: boolean;
}

export type UserId = string;
