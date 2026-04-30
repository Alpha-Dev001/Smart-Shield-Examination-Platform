import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { io, type Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { api, getApiErrorMessage } from '../lib/api'
import { Button } from '../components/ui/Button'

type Participant = {
  id: string
  studentId: string
  joinedAt: string
  submittedAt: string | null
  score: number | null
  flagCount: number
  student: { id: string; email: string }
}

type Session = {
  id: string
  status: 'PENDING' | 'LIVE' | 'ENDED'
  startedAt: string | null
  endedAt: string | null
  exam: { id: string; title: string; duration: number; randomize: boolean }
  _count: { participants: number }
}

type ProctoringEvent = {
  id: string
  sessionId: string
  studentId: string
  type: string
  occurredAt: string
  student?: { id: string; email: string }
}

type FlagSummary = { flagCount: number; student: { id: string; email: string } }

type SessionResultsResponse = {
  results: {
    participant: { studentId: string; student: { email: string } }
    scoring: {
      percentage: number
      earnedPoints: number
      totalPoints: number
      attemptedQuestions: number
      totalQuestions: number
      correctAnswers: number
    }
  }[]
}

type ShortAnswerItem = {
  answerId: string
  questionId: string
  questionText: string
  value: unknown
  points: number
  awardedPoints: number | null
}

type ShortAnswersResponse = {
  participants: {
    studentId: string
    student: { email: string }
    answers: ShortAnswerItem[]
  }[]
}

export function TeacherSessionPage() {
  const { sessionId } = useParams()
  const [session, setSession] = useState<Session | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [events, setEvents] = useState<ProctoringEvent[]>([])
  const [flags, setFlags] = useState<FlagSummary[]>([])
  const [results, setResults] = useState<SessionResultsResponse | null>(null)
  const [shortAnswers, setShortAnswers] = useState<ShortAnswersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'participants' | 'results' | 'proctoring'>(
    'participants',
  )

  const socketRef = useRef<Socket | null>(null)
  const token = useMemo(() => localStorage.getItem('access_token'), [])

  async function load() {
    if (!sessionId) return
    setLoading(true)
    try {
      const s = await api.get<Session>(`/sessions/${sessionId}`)
      setSession(s.data)
      const p = await api.get<Participant[]>(`/sessions/${sessionId}/participants`)
      setParticipants(p.data)
      const ev = await api.get<ProctoringEvent[]>(`/proctoring/session/${sessionId}/events`)
      setEvents(ev.data)
      const fl = await api.get<FlagSummary[]>(`/proctoring/session/${sessionId}/flags`)
      setFlags(fl.data)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  async function loadResults() {
    if (!sessionId) return
    try {
      const r = await api.get<SessionResultsResponse>(`/results/session/${sessionId}`)
      setResults(r.data)
      const sa = await api.get<ShortAnswersResponse>(
        `/results/session/${sessionId}/short-answers`,
      )
      setShortAnswers(sa.data)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  useEffect(() => {
    // eslint-disable-next-line
    void load()
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
    socket.on('student-flagged', (payload) => {
      setEvents((prev) => [
        {
          id: crypto.randomUUID(),
          sessionId,
          studentId: payload.studentId,
          type: payload.type,
          occurredAt: new Date(payload.at ?? Date.now()).toISOString(),
          student: payload.email ? { id: payload.studentId, email: payload.email } : undefined,
        },
        ...prev,
      ])
      void load()
    })
    socket.on('student-joined', () => void load())
    socket.on('student-disconnected', () => void load())

    socket.on('error', (e) => {
      toast.error(typeof e?.message === 'string' ? e.message : 'WebSocket error')
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  async function broadcastMessage() {
    const socket = socketRef.current
    if (!socket || !sessionId) return
    const msg = prompt('Message to students')
    if (!msg?.trim()) return
    socket.emit('broadcast-message', { sessionId, message: msg.trim() })
    toast.success('Message sent')
  }

  if (loading) return <div className="text-sm smesh-muted">Loading…</div>
  if (!session) return <div className="text-sm smesh-muted">Session not found.</div>

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm smesh-muted hover:underline" to={`/teacher/exams/${session.exam.id}`}>
          ← Back to exam
        </Link>
        <h1 className="mt-2 smesh-h2">
          Session {session.id}
        </h1>
        <div className="mt-1 text-sm smesh-muted">
          Exam: <span className="text-[#0b1220]">{session.exam.title}</span> · Status:{' '}
          <span className="text-[#0b1220]">{session.status}</span> · Participants:{' '}
          <span className="text-[#0b1220]">{session._count.participants}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === 'participants' ? 'primary' : 'secondary'} onClick={() => setTab('participants')}>
          Participants
        </Button>
        <Button variant={tab === 'results' ? 'primary' : 'secondary'} onClick={() => { setTab('results'); void loadResults() }}>
          Results
        </Button>
        <Button variant={tab === 'proctoring' ? 'primary' : 'secondary'} onClick={() => setTab('proctoring')}>
          Proctoring
        </Button>
        <div className="flex-1" />
        <Button variant="secondary" onClick={() => void load()}>
          Refresh
        </Button>
        <Button variant="secondary" onClick={broadcastMessage}>
          Broadcast
        </Button>
      </div>

      {tab === 'participants' ? (
        <section className="smesh-card p-6">
          <h2 className="text-base font-semibold text-[#0b1220]">Participants</h2>
          <div className="mt-4 space-y-2">
            {participants.length === 0 ? (
              <div className="text-sm smesh-muted">No participants yet.</div>
            ) : (
              participants.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-2 smesh-card-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-medium text-[#0b1220]">{p.student.email}</div>
                    <div className="mt-1 text-xs smesh-muted">
                      Joined: {new Date(p.joinedAt).toLocaleString()} · Submitted:{' '}
                      {p.submittedAt ? new Date(p.submittedAt).toLocaleString() : '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#1b2a44]">
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-[rgba(11,18,32,0.14)]">
                      Score: {p.score ?? '—'}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 ring-1 ring-[rgba(11,18,32,0.14)]">
                      Flags: {p.flagCount}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ) : tab === 'results' ? (
        <section className="smesh-card p-6">
          <h2 className="text-base font-semibold text-[#0b1220]">Results</h2>
          <p className="mt-1 text-sm smesh-muted">
            Auto-grading is applied on submission. Short answers can be graded here and scores will update.
          </p>

          {!results ? (
            <div className="mt-4 text-sm smesh-muted">Loading…</div>
          ) : (
            <div className="mt-4 space-y-3">
              {results.results?.map((r) => (
                <div key={r.participant.studentId} className="smesh-card-soft p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#0b1220]">{r.participant.student.email}</div>
                      <div className="mt-1 text-xs smesh-muted">
                        Score: {r.scoring.percentage}% · Earned {r.scoring.earnedPoints}/{r.scoring.totalPoints}
                      </div>
                    </div>
                    <div className="text-xs smesh-muted">
                      Attempted: {r.scoring.attemptedQuestions}/{r.scoring.totalQuestions} · Correct: {r.scoring.correctAnswers}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-[#0b1220]">Short-answer grading</h3>
            {!shortAnswers ? (
              <div className="mt-3 text-sm smesh-muted">Loading…</div>
            ) : (
              <div className="mt-3 space-y-4">
                {shortAnswers.participants?.map((p) => (
                  <div key={p.studentId} className="smesh-card p-4">
                    <div className="text-sm font-semibold text-[#0b1220]">
                      {p.student.email}
                    </div>
                    <div className="mt-3 space-y-3">
                      {p.answers.length === 0 ? (
                        <div className="text-sm smesh-muted">No short answers.</div>
                      ) : (
                        p.answers.map((a) => (
                          <ShortAnswerGradeCard key={a.answerId} sessionId={sessionId!} studentId={p.studentId} answer={a} onGraded={loadResults} />
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="smesh-card p-6">
          <h2 className="text-base font-semibold text-[#0b1220]">Proctoring</h2>
          <p className="mt-1 text-sm smesh-muted">
            Live events come in via WebSocket, and are also persisted in Postgres.
          </p>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <div className="text-sm font-semibold text-[#0b1220]">Flag summary</div>
              <div className="mt-3 space-y-2">
                {flags.length === 0 ? (
                  <div className="text-sm smesh-muted">No flags yet.</div>
                ) : (
                  flags.map((f) => (
                    <div
                      key={f.student.id}
                      className="flex items-center justify-between smesh-card-soft px-4 py-3"
                    >
                      <div className="text-sm text-[#0b1220]">{f.student.email}</div>
                      <div className="text-sm font-semibold text-[#0b1220]">{f.flagCount}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#0b1220]">Events</div>
              <div className="mt-3 space-y-2">
                {events.length === 0 ? (
                  <div className="text-sm smesh-muted">No events yet.</div>
                ) : (
                  events.slice(0, 50).map((e) => (
                    <div
                      key={e.id}
                      className="smesh-card-soft px-4 py-3"
                    >
                      <div className="text-sm font-medium text-[#0b1220]">{e.type}</div>
                      <div className="mt-1 text-xs smesh-muted">
                        {e.student?.email ? `${e.student.email} · ` : ''}
                        {new Date(e.occurredAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function ShortAnswerGradeCard({
  sessionId,
  studentId,
  answer,
  onGraded,
}: {
  sessionId: string
  studentId: string
  answer: ShortAnswerItem
  onGraded: () => Promise<void>
}) {
  const [value, setValue] = useState<string>(String(answer.awardedPoints ?? ''))
  const [saving, setSaving] = useState(false)

  async function grade() {
    const points = Number(value)
    if (!Number.isFinite(points) || points < 0) {
      toast.error('Awarded points must be >= 0')
      return
    }
    setSaving(true)
    try {
      await api.patch('/results/grade-short-answer', {
        sessionId,
        studentId,
        questionId: answer.questionId,
        awardedPoints: points,
      })
      toast.success('Graded')
      await onGraded()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="smesh-card-soft p-4">
      <div className="text-sm font-medium text-[#0b1220]">{answer.questionText}</div>
      <div className="mt-1 text-xs smesh-muted">
        Points: {answer.points} · Awarded: {answer.awardedPoints ?? '—'}
      </div>
      <div className="mt-3 text-sm text-[#1b2a44]">
        <span className="font-medium text-[#0b1220]">Student answer:</span>{' '}
        <span className="font-mono break-words whitespace-pre-wrap">
          {JSON.stringify(answer.value)}
        </span>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium text-[#1b2a44]">Awarded points</span>
          <input
            className="w-full rounded-xl border border-[rgba(11,18,32,0.16)] bg-white px-4 py-2.5 text-sm outline-none shadow-sm transition focus:border-[rgba(7,27,58,0.35)] focus:ring-2 focus:ring-[rgba(7,27,58,0.16)]"
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <Button variant="secondary" onClick={grade} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

