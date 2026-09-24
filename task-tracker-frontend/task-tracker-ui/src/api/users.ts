import { api } from './client';
import { User } from '../types';

export const usersApi = {
  me: () => api.get<User>('/users/me'),
  all: () => api.get<User[]>('/users'),
  remove: (id: string) => api.delete<{ message: string }>(`/users/${id}`),
};
