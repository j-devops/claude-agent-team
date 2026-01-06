import type { ApiResponse } from '@shared/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(
      error.error?.message || 'An error occurred',
      response.status,
      error.error?.code
    )
  }
  
  const data: ApiResponse<T> = await response.json()
  
  if (data.error) {
    throw new ApiError(data.error.message, response.status, data.error.code)
  }
  
  return data.data
}

export async function apiGet<T>(
  endpoint: string,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  })
  
  return handleResponse<T>(response)
}

export async function apiPost<T, D = unknown>(
  endpoint: string,
  data: D,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  
  return handleResponse<T>(response)
}

export async function apiPut<T, D = unknown>(
  endpoint: string,
  data: D,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  })
  
  return handleResponse<T>(response)
}

export async function apiDelete<T>(
  endpoint: string,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers,
  })
  
  return handleResponse<T>(response)
}
