import { create } from 'zustand'
import type { Task, TaskFilter } from '@shared/types'

interface TaskState {
  tasks: Task[]
  selectedTask: Task | null
  filter: TaskFilter
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setSelectedTask: (task: Task | null) => void
  setFilter: (filter: TaskFilter) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  selectedTask: null,
  filter: {},
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setFilter: (filter) => set({ filter }),
}))
