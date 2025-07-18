// src/app/models/user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  password?: string; // Only for signup, not stored
  phone?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  createdAt: string;
  updatedAt: string;
}