import { useTaskStore } from '../stores/taskStore'
import type { Task } from '@shared/types'

export function TaskFilter() {
  const { filter, setFilter } = useTaskStore()

  const handleStatusChange = (status: Task['status'] | '') => {
    setFilter({ ...filter, status: status || undefined })
  }

  const handleSearchChange = (search: string) => {
    setFilter({ ...filter, search: search || undefined })
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search tasks..."
            className="input-field"
            value={filter.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search tasks"
          />
        </div>
        <div className="w-full sm:w-48">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            className="input-field"
            value={filter.status || ''}
            onChange={(e) => handleStatusChange(e.target.value as Task['status'] | '')}
            aria-label="Filter by status"
          >
            <option value="">All</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
    </div>
  )
}
