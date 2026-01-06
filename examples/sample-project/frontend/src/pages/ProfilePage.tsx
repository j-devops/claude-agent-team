import { useAuthStore } from '../stores/authStore'

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)

  if (!user) return null

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="card">
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Name</h2>
            <p className="mt-1 text-lg text-gray-900">{user.name}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Email</h2>
            <p className="mt-1 text-lg text-gray-900">{user.email}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Role</h2>
            <p className="mt-1 text-lg text-gray-900 capitalize">{user.role}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500">Member Since</h2>
            <p className="mt-1 text-lg text-gray-900">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
