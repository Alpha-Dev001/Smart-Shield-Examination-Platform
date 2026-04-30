import { useAuth } from '../store/auth'

export function StudentClassPage() {
  const auth = useAuth()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Class</h1>
        <p className="mt-2 text-gray-600">View your class information and details</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Class ID</span>
            <span className="text-sm text-gray-600">{auth.user?.classId || 'Not assigned'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <span className="text-sm text-green-600 font-medium">
              {auth.user?.classId ? 'Enrolled' : 'Not enrolled'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm font-medium text-gray-700">Teacher</span>
            <span className="text-sm text-gray-600">Assigned teacher information will appear here</span>
          </div>
        </div>
      </div>
    </div>
  )
}
