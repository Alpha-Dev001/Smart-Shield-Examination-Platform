import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { io, type Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { api, getApiErrorMessage } from '../lib/api'
import { Button } from '../components/ui/Button'

type Question = {
  id: string
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER'
  text: string
  options: any
  order: number
  points: number
}

type JoinResponse = {
  participant: any
  questions: Question[]
  duration: number
  rejoined: boolean
}

export function StudentTakeSessionPage() {
  const { sessionId } = useParams()
  const [data, setData] = useState<JoinResponse | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const token = useMemo(() => localStorage.getItem('access_token'), [])

  async function join() {
    if (!sessionId) return
    const res = await api.post<JoinResponse>(`/sessions/${sessionId}/join`, {})
    setData(res.data)
  }

  async function loadMyAnswers() {
    if (!sessionId) return
    try {
      const res = await api.get<any[]>(`/sessions/${sessionId}/my-answers`)
      const map: Record<string, any> = {}
      for (const a of res.data) map[a.questionId] = a.value
      setAnswers(map)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        await join()
        await loadMyAnswers()
      } catch (e) {
        toast.error(getApiErrorMessage(e))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  useEffect(() => {
    if (!sessionId || !token) return

    const urlBase =
      import.meta.env.VITE_WS_BASE_URL?.toString() ?? 'http://localhost:3000'
    const socket = io(`${urlBase}/proctoring`, {
      transports: ['websocket'],
      auth: { token },
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join-room', { sessionId })
    })

    const hb = setInterval(() => {
      socket.emit('heartbeat', { sessionId })
    }, 15_000)

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        socket.emit('flag-event', { sessionId, type: 'TAB_SWITCH' })
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    socket.on('session-ended', () => {
      toast.message('Session ended. Please submit your answers.')
    })
    socket.on('kicked', (payload) => {
      toast.error(payload?.message ?? 'You were removed from the session')
    })

    return () => {
      clearInterval(hb)
      document.removeEventListener('visibilitychange', onVisibility)
      socket.disconnect()
      socketRef.current = null
    }
  }, [sessionId, token])

  async function save(questionId: string, value: any) {
    if (!sessionId) return
    setSaving(questionId)
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    try {
      await api.post(`/sessions/${sessionId}/answers`, { questionId, value })
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setSaving(null)
    }
  }

  async function submit() {
    if (!sessionId) return
    setSubmitting(true)
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      }
      const res = await api.post(`/sessions/${sessionId}/submit`, payload)
      toast.success(`Submitted. Score: ${res.data.score ?? '—'}`)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  if (!data) return <div className="text-sm smesh-muted">Joining…</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link className="text-sm smesh-muted hover:underline" to="/student">
            ← Home
          </Link>
          <h1 className="mt-2 break-words smesh-h2">Session {sessionId}</h1>
          <div className="mt-1 text-sm smesh-muted">
            Duration: {data.duration} min · Questions: {data.questions.length}{' '}
            {data.rejoined ? '· Rejoined' : ''}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/student/results/${sessionId}`}
            className="rounded-full border border-[rgba(11,18,32,0.14)] bg-white px-4 py-2 text-sm shadow-sm hover:bg-[rgba(7,27,58,0.03)]"
          >
            My results
          </Link>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit exam'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {data.questions
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((q) => (
            <div key={q.id} className="smesh-card p-5">
              <div className="text-sm font-semibold text-[#0b1220]">
                {q.type} · {q.points} pt
              </div>
              <div className="mt-1 text-sm text-[#1b2a44]">{q.text}</div>

              <div className="mt-4">
                {q.type === 'MCQ' && Array.isArray(q.options) ? (
                  <div className="space-y-2">
                    {q.options.map((opt: string) => (
                      <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-[#1b2a44]">
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === opt}
                          onChange={() => void save(q.id, opt)}
                          className="h-4 w-4 accent-[#071B3A]"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : q.type === 'TRUE_FALSE' ? (
                  <div className="flex gap-3">
                    <Button
                      variant={answers[q.id] === true ? 'primary' : 'secondary'}
                      onClick={() => void save(q.id, true)}
                      disabled={saving === q.id}
                    >
                      True
                    </Button>
                    <Button
                      variant={answers[q.id] === false ? 'primary' : 'secondary'}
                      onClick={() => void save(q.id, false)}
                      disabled={saving === q.id}
                    >
                      False
                    </Button>
                  </div>
                ) : (
                  <textarea
                    className="w-full rounded-xl border border-[rgba(11,18,32,0.16)] bg-white p-3 text-sm outline-none shadow-sm transition focus:border-[rgba(7,27,58,0.35)] focus:ring-2 focus:ring-[rgba(7,27,58,0.16)]"
                    rows={3}
                    value={answers[q.id] ?? ''}
                    onChange={(e) => void save(q.id, e.target.value)}
                    placeholder="Type your answer…"
                  />
                )}
              </div>

              {saving === q.id ? (
                <div className="mt-2 text-xs text-[#5b6474]">Saving…</div>
              ) : (
                <div className="mt-2 text-xs text-[#5b6474]">Saved automatically.</div>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}

