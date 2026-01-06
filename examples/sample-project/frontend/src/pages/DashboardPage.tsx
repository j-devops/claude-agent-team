import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useTaskStore } from '../stores/taskStore'
import { tasksApi } from '../api/tasks'
import { TaskList } from '../components/TaskList'
import { TaskFilter } from '../components/TaskFilter'
import { CreateTaskModal } from '../components/CreateTaskModal'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'

export function DashboardPage() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const { tasks, setTasks, filter } = useTaskStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const loadTasks = async () => {
    if (!token) return
    
    try {
      setIsLoading(true)
      setError('')
      const response = await tasksApi.getTasks(token, filter)
      setTasks(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [filter])

  const handleTaskCreated = () => {
    setIsCreateModalOpen(false)
    loadTasks()
  }

  // Keyboard shortcuts
  useKeyboardShortcut('n', () => setIsCreateModalOpen(true), { ctrl: true })
  useKeyboardShortcut('r', () => loadTasks(), { ctrl: true })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {user?.name}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
          aria-label="Create new task"
        >
          + New Task
        </button>
      </div>

      <TaskFilter />

      {error && (
        <div className="rounded-md bg-red-50 p-4" role="alert">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks found. Create your first task to get started!</p>
        </div>
      ) : (
        <TaskList tasks={tasks} />
      )}

      {isCreateModalOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  )
}
