import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { api, getApiErrorMessage } from '../lib/api'

export function StudentResultsPage() {
  const { sessionId } = useParams()
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      if (!sessionId) return
      setLoading(true)
      try {
        const res = await api.get(`/results/session/${sessionId}/my-results`)
        setData(res.data)
      } catch (e) {
        toast.error(getApiErrorMessage(e))
      } finally {
        setLoading(false)
      }
    })()
  }, [sessionId])

  if (loading) return <div className="text-sm smesh-muted">Loading…</div>
  if (!data) return <div className="text-sm smesh-muted">No results.</div>

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm smesh-muted hover:underline" to={`/student/sessions/${sessionId}`}>
          ← Back to session
        </Link>
        <h1 className="mt-2 smesh-h2">My results</h1>
        <div className="mt-1 text-sm smesh-muted">
          {data.session.examTitle} · Score: <span className="text-[#0b1220]">{data.result.percentage}%</span>
        </div>
      </div>

      <section className="smesh-card p-6">
        <h2 className="text-base font-semibold text-[#0b1220]">Summary</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="smesh-card-soft p-4">
            <div className="text-xs smesh-muted">Earned points</div>
            <div className="text-lg font-semibold text-[#0b1220]">
              {data.result.earnedPoints}/{data.result.totalPoints}
            </div>
          </div>
          <div className="smesh-card-soft p-4">
            <div className="text-xs smesh-muted">Correct answers</div>
            <div className="text-lg font-semibold text-[#0b1220]">
              {data.result.correctAnswers}/{data.result.totalQuestions}
            </div>
          </div>
          <div className="smesh-card-soft p-4">
            <div className="text-xs smesh-muted">Time taken</div>
            <div className="text-lg font-semibold text-[#0b1220]">
              {data.result.timeTaken ?? '—'} min
            </div>
          </div>
        </div>
      </section>

      <section className="smesh-card p-6">
        <h2 className="text-base font-semibold text-[#0b1220]">Answers</h2>
        <div className="mt-4 space-y-3">
          {data.answers.map((a: any) => (
            <div key={a.questionId} className="smesh-card-soft p-4">
              <div className="text-sm font-semibold text-[#0b1220]">{a.question}</div>
              <div className="mt-1 text-xs smesh-muted">
                {a.type} · {a.points} pt · Earned: {a.earnedPoints}
              </div>
              <div className="mt-3 text-sm text-[#1b2a44]">
                <div>
                  <span className="font-medium text-[#0b1220]">Your answer:</span>{' '}
                  <span className="font-mono break-words whitespace-pre-wrap">
                    {JSON.stringify(a.studentAnswer)}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="font-medium text-[#0b1220]">Correct answer:</span>{' '}
                  <span className="font-mono break-words whitespace-pre-wrap">
                    {JSON.stringify(a.correctAnswer)}
                  </span>
                </div>
                {a.explanation ? (
                  <div className="mt-2 text-xs smesh-muted">{a.explanation}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

