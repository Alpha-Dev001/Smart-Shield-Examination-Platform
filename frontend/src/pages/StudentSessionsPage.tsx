import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Key, BookOpen, AlertCircle } from 'lucide-react'

export function StudentSessionsPage() {
  const [sessionId, setSessionId] = useState('')
  const nav = useNavigate()

  function go() {
    if (!sessionId.trim()) return
    nav(`/student/sessions/${sessionId.trim()}`)
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mx-auto w-16 h-16 bg-[rgba(7,27,58,0.1)] rounded-2xl flex items-center justify-center mb-4">
          <Key className="h-8 w-8 text-[#071B3A]" />
        </div>
        <h1 className="smesh-h2 mb-3">Join Exam Session</h1>
        <p className="text-sm smesh-muted">
          Enter the session ID provided by your teacher to join the live exam session.
        </p>
      </div>

      <div className="smesh-card max-w-lg mx-auto p-8">
        <div className="space-y-6">
          <div>
            <Input
              label="Session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter session ID..."
              className="text-center text-lg font-mono tracking-wider"
            />
          </div>

          <div className="bg-[rgba(7,27,58,0.02)] p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#5b6474] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-[#5b6474]">
                <p className="font-medium mb-1">Session Requirements:</p>
                <ul className="space-y-1">
                  <li>• Get the session ID from your teacher</li>
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Complete the exam in one sitting</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={go}
              className="flex-1 shadow-md"
              disabled={!sessionId.trim()}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Join Session
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSessionId('')
                toast.message('Session ID cleared')
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

