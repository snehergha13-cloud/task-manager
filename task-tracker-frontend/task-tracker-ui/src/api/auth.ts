import { api } from './client';
import { User } from '../types';

export interface LoginResponse {
  access_token: string;
  user: User;
}

export function registerUser(data: { email: string; name: string; password: string }) {
  return api.post<User>('/auth/register', data);
}

export function loginUser(data: { email: string; password: string }) {
  return api.post<LoginResponse>('/auth/login', data);
}
