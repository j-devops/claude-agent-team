import { Link } from 'react-router-dom'
import type { Task } from '@shared/types'

interface TaskListProps {
  tasks: Task[]
}

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

export function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Link
          key={task.id}
          to={'/tasks/' + task.id}
          className="card hover:shadow-md transition-shadow block"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={'px-2 py-1 text-xs font-medium rounded-full ' + statusColors[task.status]}
                >
                  {statusLabels[task.status]}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(task.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
