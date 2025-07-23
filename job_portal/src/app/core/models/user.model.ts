// src/app/models/user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  password?: string; // Only for signup, not stored
  phone?: string;
  location?: string;
  address?: string; // Full address including street, city, state, country
  skills?: string[];
  experience?: string;
  education?: string;
  createdAt: string;
  updatedAt: string;
}