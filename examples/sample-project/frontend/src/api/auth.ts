import type { LoginRequest, RegisterRequest, AuthResponse } from '@shared/types'
import { apiPost } from './client'

export const authApi = {
  login: (data: LoginRequest) =>
    apiPost<AuthResponse, LoginRequest>('/auth/login', data),
  
  register: (data: RegisterRequest) =>
    apiPost<AuthResponse, RegisterRequest>('/auth/register', data),
  
  logout: (token: string) =>
    apiPost<void, {}>('/auth/logout', {}, token),
}
