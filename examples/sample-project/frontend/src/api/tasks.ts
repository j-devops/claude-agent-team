import type { Task, CreateTaskRequest, UpdateTaskRequest, PaginatedResponse, TaskFilter } from '@shared/types'
import { apiGet, apiPost, apiPut, apiDelete } from './client'

export const tasksApi = {
  getTasks: (token: string, filter?: TaskFilter) => {
    const params = new URLSearchParams()
    if (filter?.status) params.append('status', filter.status)
    if (filter?.assigneeId) params.append('assigneeId', filter.assigneeId)
    if (filter?.search) params.append('search', filter.search)
    
    const query = params.toString()
    const endpoint = query ? '/tasks?' + query : '/tasks'
    return apiGet<PaginatedResponse<Task>>(endpoint, token)
  },
  
  getTask: (id: string, token: string) =>
    apiGet<Task>('/tasks/' + id, token),
  
  createTask: (data: CreateTaskRequest, token: string) =>
    apiPost<Task, CreateTaskRequest>('/tasks', data, token),
  
  updateTask: (id: string, data: UpdateTaskRequest, token: string) =>
    apiPut<Task, UpdateTaskRequest>('/tasks/' + id, data, token),
  
  deleteTask: (id: string, token: string) =>
    apiDelete<void>('/tasks/' + id, token),
}
