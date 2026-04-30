import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function StudentSessionsPage() {
  const [sessionId, setSessionId] = useState('')
  const nav = useNavigate()

  function go() {
    if (!sessionId.trim()) return
    nav(`/student/sessions/${sessionId.trim()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="smesh-h2">Sessions</h1>
        <p className="mt-1 text-sm smesh-muted">
          Enter a session ID from your teacher to join the live exam session.
        </p>
      </div>

      <div className="smesh-card max-w-md p-6">
        <Input label="Session ID" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
        <div className="mt-4 flex gap-2">
          <Button onClick={go}>Join</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSessionId('')
              toast.message('Cleared')
            }}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}

