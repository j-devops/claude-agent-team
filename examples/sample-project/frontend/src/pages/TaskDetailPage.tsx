import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { tasksApi } from '../api/tasks'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Task } from '@shared/types'

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
}

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const loadTask = async () => {
      if (!token || !id) return

      try {
        setIsLoading(true)
        setError('')
        const taskData = await tasksApi.getTask(id, token)
        setTask(taskData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task')
      } finally {
        setIsLoading(false)
      }
    }

    loadTask()
  }, [id, token])

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (!token || !id || !task) return

    try {
      setIsUpdating(true)
      const updatedTask = await tasksApi.updateTask(id, { status: newStatus }, token)
      setTask(updatedTask)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !id) return
    if (!window.confirm('Are you sure you want to delete this task?')) return

    try {
      setIsUpdating(true)
      await tasksApi.deleteTask(id, token)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error && !task) {
    return (
      <div className="card">
        <div className="rounded-md bg-red-50 p-4" role="alert">
          <p className="text-sm text-red-800">{error}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary mt-4"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (!task) {
    return null
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center"
        aria-label="Back to dashboard"
      >
        ← Back to Dashboard
      </button>

      <div className="card">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4" role="alert">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          <button
            onClick={handleDelete}
            disabled={isUpdating}
            className="text-red-600 hover:text-red-700 font-medium"
            aria-label="Delete task"
          >
            Delete
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {(['todo', 'in_progress', 'done'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating || task.status === status}
                  className={'px-4 py-2 text-sm font-medium rounded-lg transition-colors ' +
                    (task.status === status
                      ? statusColors[status]
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                  aria-label={'Change status to ' + statusLabels[status]}
                  aria-pressed={task.status === status}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-2">Description</h2>
            <p className="text-gray-900 whitespace-pre-wrap">{task.description}</p>
          </div>

          <div className="border-t pt-4">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Created</dt>
                <dd className="text-gray-900 mt-1">
                  {new Date(task.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Last Updated</dt>
                <dd className="text-gray-900 mt-1">
                  {new Date(task.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
