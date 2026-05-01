import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { api, getApiErrorMessage } from '../lib/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ArrowLeft } from 'lucide-react'

type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER'

type Exam = {
  id: string
  title: string
  duration: number
  startAt: string
  randomize: boolean
  class: { id: string; name: string }
  questions: {
    id: string
    type: QuestionType
    text: string
    options: any
    answer: any
    order: number
    points: number
    explanation: string | null
  }[]
}

type SessionSummary = {
  id: string
  status: 'PENDING' | 'LIVE' | 'ENDED'
  startedAt: string | null
  endedAt: string | null
  _count: { participants: number }
}

export function TeacherExamPage() {
  const { examId } = useParams()
  const nav = useNavigate()
  const [exam, setExam] = useState<Exam | null>(null)
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)

  const [qType, setQType] = useState<QuestionType>('MCQ')
  const [qText, setQText] = useState('')
  const [qOptions, setQOptions] = useState('')
  const [qAnswer, setQAnswer] = useState('')
  const [qBoolAnswer, setQBoolAnswer] = useState<'true' | 'false'>('true')
  const [qPoints, setQPoints] = useState('1')
  const [qExplanation, setQExplanation] = useState('')
  const [adding, setAdding] = useState(false)

  const [creatingSession, setCreatingSession] = useState(false)

  const typeHelp = useMemo(() => {
    if (qType === 'MCQ') return 'Options comma-separated, answer must match exactly one option.'
    if (qType === 'TRUE_FALSE') return 'Answer is true/false.'
    return 'Short answers are manually graded (points set per question).'
  }, [qType])

  async function load() {
    if (!examId) return
    setLoading(true)
    try {
      const res = await api.get<Exam>(`/exams/${examId}`)
      setExam(res.data)
      const ses = await api.get<SessionSummary[]>(`/sessions/exam/${examId}`)
      setSessions(ses.data)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
      setExam(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId])

  async function deleteExam() {
    if (!examId) return
    try {
      await api.delete(`/exams/${examId}`)
      toast.success('Exam deleted')
      nav(`/teacher/classes/${exam?.class.id ?? ''}`, { replace: true })
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  async function addQuestion() {
    if (!examId) return
    if (!qText.trim()) return

    const points = Number(qPoints)
    if (!Number.isFinite(points) || points < 1) {
      toast.error('Points must be >= 1')
      return
    }

    const payload: any = {
      type: qType,
      text: qText.trim(),
      points,
      explanation: qExplanation.trim() ? qExplanation.trim() : undefined,
    }

    if (qType === 'MCQ') {
      const options = qOptions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (options.length < 2) {
        toast.error('MCQ must have at least 2 options')
        return
      }
      if (!options.includes(qAnswer.trim())) {
        toast.error('MCQ answer must match one option exactly')
        return
      }
      payload.options = options
      payload.answer = qAnswer.trim()
    } else if (qType === 'TRUE_FALSE') {
      payload.answer = qBoolAnswer === 'true'
    } else {
      // SHORT_ANSWER: store a reference answer (optional but required by backend)
      payload.answer = qAnswer.trim() ? qAnswer.trim() : ''
    }

    setAdding(true)
    try {
      await api.post(`/exams/${examId}/questions`, payload)
      toast.success('Question added')
      setQText('')
      setQOptions('')
      setQAnswer('')
      setQPoints('1')
      setQExplanation('')
      await load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setAdding(false)
    }
  }

  async function deleteQuestion(questionId: string) {
    if (!examId) return
    try {
      await api.delete(`/exams/${examId}/questions/${questionId}`)
      toast.success('Question deleted')
      await load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  async function createSession() {
    if (!examId) return
    setCreatingSession(true)
    try {
      const res = await api.post('/sessions', { examId })
      toast.success(`Session created: ${res.data.id}`)
      await load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setCreatingSession(false)
    }
  }

  async function startSession(sessionId: string) {
    try {
      await api.patch(`/sessions/${sessionId}/start`, {})
      toast.success('Session started')
      await load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  async function endSession(sessionId: string) {
    try {
      await api.patch(`/sessions/${sessionId}/end`, {})
      toast.success('Session ended')
      await load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  if (loading) return <div className="text-sm smesh-muted">Loading…</div>
  if (!exam) return <div className="text-sm smesh-muted">Exam not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
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
          <h1 className="mt-2 smesh-h2">{exam.title}</h1>
          <div className="mt-1 text-sm smesh-muted">
            Duration: <span className="text-[#0b1220]">{exam.duration} min</span> · Starts:{' '}
            <span className="text-[#0b1220]">{new Date(exam.startAt).toLocaleString()}</span> ·{' '}
            Randomize: <span className="text-[#0b1220]">{exam.randomize ? 'Yes' : 'No'}</span>
          </div>
        </div>
        <Button variant="danger" onClick={deleteExam}>
          Delete exam
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="smesh-card p-6">
          <h2 className="text-base font-semibold text-[#0b1220]">Questions</h2>
          <p className="mt-1 text-sm smesh-muted">{typeHelp}</p>

          <div className="mt-4 grid gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#1b2a44]">Type</span>
              <select
                className="w-full rounded-xl border border-[rgba(11,18,32,0.16)] bg-white px-4 py-2.5 text-sm outline-none shadow-sm transition focus:border-[rgba(7,27,58,0.35)] focus:ring-2 focus:ring-[rgba(7,27,58,0.16)]"
                value={qType}
                onChange={(e) => setQType(e.target.value as QuestionType)}
              >
                <option value="MCQ">MCQ</option>
                <option value="TRUE_FALSE">True/False</option>
                <option value="SHORT_ANSWER">Short answer</option>
              </select>
            </label>

            <Input label="Question text" value={qText} onChange={(e) => setQText(e.target.value)} />

            {qType === 'MCQ' ? (
              <>
                <Input
                  label="Options (comma separated)"
                  value={qOptions}
                  onChange={(e) => setQOptions(e.target.value)}
                />
                <Input
                  label="Correct answer (must match one option)"
                  value={qAnswer}
                  onChange={(e) => setQAnswer(e.target.value)}
                />
              </>
            ) : qType === 'TRUE_FALSE' ? (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[#1b2a44]">
                  Correct answer
                </span>
                <select
                  className="w-full rounded-xl border border-[rgba(11,18,32,0.16)] bg-white px-4 py-2.5 text-sm outline-none shadow-sm transition focus:border-[rgba(7,27,58,0.35)] focus:ring-2 focus:ring-[rgba(7,27,58,0.16)]"
                  value={qBoolAnswer}
                  onChange={(e) => setQBoolAnswer(e.target.value as any)}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </label>
            ) : (
              <Input
                label="Reference answer (optional)"
                value={qAnswer}
                onChange={(e) => setQAnswer(e.target.value)}
              />
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Points"
                type="number"
                min={1}
                value={qPoints}
                onChange={(e) => setQPoints(e.target.value)}
              />
              <Input
                label="Explanation (optional)"
                value={qExplanation}
                onChange={(e) => setQExplanation(e.target.value)}
              />
            </div>

            <Button onClick={addQuestion} disabled={adding}>
              {adding ? 'Adding…' : 'Add question'}
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            {exam.questions.length === 0 ? (
              <div className="text-sm smesh-muted">No questions yet.</div>
            ) : (
              exam.questions
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((q) => (
                  <div
                    key={q.id}
                    className="smesh-card-soft p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#0b1220]">
                          #{q.order} · {q.type} · {q.points} pt
                        </div>
                        <div className="mt-1 text-sm text-[#1b2a44]">{q.text}</div>
                        {q.type === 'MCQ' && Array.isArray(q.options) ? (
                          <div className="mt-2 text-xs smesh-muted">
                            Options: {q.options.join(', ')}
                          </div>
                        ) : null}
                      </div>
                      <Button variant="secondary" onClick={() => deleteQuestion(q.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>

        <section className="smesh-card p-6">
          <h2 className="text-base font-semibold text-[#0b1220]">Sessions</h2>
          <p className="mt-1 text-sm smesh-muted">
            Create a session to let students join and take the exam.
          </p>

          <div className="mt-4">
            <Button onClick={createSession} disabled={creatingSession}>
              {creatingSession ? 'Creating…' : 'Create session'}
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            {sessions.length === 0 ? (
              <div className="text-sm smesh-muted">No sessions yet.</div>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className="smesh-card-soft p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#0b1220] break-all">
                        Session {s.id}
                      </div>
                      <div className="mt-1 text-xs smesh-muted">
                        Status: {s.status} · Participants: {s._count?.participants ?? 0}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="rounded-full border border-[rgba(11,18,32,0.14)] bg-white px-4 py-2 text-sm shadow-sm hover:bg-[rgba(7,27,58,0.03)]"
                        to={`/teacher/sessions/${s.id}`}
                      >
                        Monitor
                      </Link>
                      {s.status === 'PENDING' ? (
                        <Button variant="secondary" onClick={() => startSession(s.id)}>
                          Start
                        </Button>
                      ) : null}
                      {s.status !== 'ENDED' ? (
                        <Button variant="secondary" onClick={() => endSession(s.id)}>
                          End
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

