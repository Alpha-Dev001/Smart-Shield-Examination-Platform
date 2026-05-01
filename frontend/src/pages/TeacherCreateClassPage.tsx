import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { api, getApiErrorMessage } from '../lib/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function TeacherCreateClassPage() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Class name is required')
      return
    }

    if (name.length < 3) {
      toast.error('Class name must be at least 3 characters')
      return
    }

    if (name.length > 50) {
      toast.error('Class name must not exceed 50 characters')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/classes', { name: name.trim() })
      toast.success('Class created successfully!')
      nav(`/teacher/classes/${response.data.id}`)
    } catch (error) {
      console.error('Failed to create class:', error)
      toast.error(getApiErrorMessage(error) || 'Failed to create class')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div>
        <Button
          variant="secondary"
          onClick={() => nav('/teacher/classes')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#071B3A] [font-family:Inter,system-ui,-apple-system,sans-serif]">Create New Class</h1>
        <p className="mt-2 text-sm text-[#5b6474]">Set up a new class for your students</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Class Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Advanced Mathematics, Physics 101"
                required
                disabled={loading}
                className="text-lg"
              />
              <p className="mt-2 text-sm text-slate-600">
                Choose a descriptive name for your class (3-50 characters)
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-gradient-to-r from-[#071B3A] to-[#051629] hover:from-[#051629] hover:to-[#071B3A] text-white px-6 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Class...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Class
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Info Dropdown */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#071B3A] rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">What happens next?</h3>
                <p className="text-sm text-slate-600">Click to learn more</p>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <div className={`transition-all duration-300 ease-in-out ${isDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}>
            <div className="px-6 pb-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#071B3A] rounded-full mt-1 flex-shrink-0"></div>
                    <span>A unique join code will be automatically generated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#071B3A] rounded-full mt-1 flex-shrink-0"></div>
                    <span>Students can join using this code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#071B3A] rounded-full mt-1 flex-shrink-0"></div>
                    <span>You can create exams and manage students</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#071B3A] rounded-full mt-1 flex-shrink-0"></div>
                    <span>All class activities will be tracked</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
