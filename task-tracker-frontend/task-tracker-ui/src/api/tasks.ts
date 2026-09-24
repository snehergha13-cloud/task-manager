import { api } from './client';
import { Task, TaskStatus } from '../types';

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export const tasksApi = {
  list: () => api.get<Task[]>('/tasks'),
  create: (data: TaskInput) => api.post<Task>('/tasks', data),
  update: (id: string, data: Partial<TaskInput>) => api.put<Task>(`/tasks/${id}`, data),
  remove: (id: string) => api.delete<{ message: string }>(`/tasks/${id}`),
};
