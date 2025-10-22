// src/api/users.ts
import { api } from './api';
import { User } from '../types';

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'examiner' | 'student';
}

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/');
    return response.data;
  },

  getUser: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },

  createUser: async (userData: CreateUserData): Promise<User> => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}/`, userData);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}/`);
  },

  resetPassword: async (id: number, newPassword: string): Promise<void> => {
    await api.post(`/users/${id}/reset-password/`, { new_password: newPassword });
  },
};