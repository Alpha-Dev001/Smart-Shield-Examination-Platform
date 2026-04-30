import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { api, getApiErrorMessage } from '../lib/api'
import { Award, TrendingUp, Clock, CheckCircle, ArrowLeft } from 'lucide-react'

export function StudentResultsPage() {
  const { sessionId } = useParams()
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ; (async () => {
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
    <div className="space-y-8">
      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm smesh-muted hover:text-[#0b1220] transition-colors"
          to={`/student/sessions/${sessionId}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to session
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-[rgba(7,27,58,0.1)] rounded-xl flex items-center justify-center">
            <Award className="h-6 w-6 text-[#071B3A]" />
          </div>
          <div>
            <h1 className="smesh-h2">Exam Results</h1>
            <div className="mt-1 text-sm smesh-muted">
              {data.session.examTitle} · Score: <span className="font-semibold text-[#0b1220]">{data.result.percentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <section className="smesh-card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0b1220]">
          <TrendingUp className="h-5 w-5" />
          Performance Summary
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="smesh-card-soft p-5 text-center">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-xs smesh-muted mb-1">Earned Points</div>
            <div className="text-2xl font-bold text-[#0b1220]">
              {data.result.earnedPoints}/{data.result.totalPoints}
            </div>
          </div>
          <div className="smesh-card-soft p-5 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-xs smesh-muted mb-1">Correct Answers</div>
            <div className="text-2xl font-bold text-[#0b1220]">
              {data.result.correctAnswers}/{data.result.totalQuestions}
            </div>
          </div>
          <div className="smesh-card-soft p-5 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-xs smesh-muted mb-1">Time Taken</div>
            <div className="text-2xl font-bold text-[#0b1220]">
              {data.result.timeTaken ?? '—'} min
            </div>
          </div>
        </div>
      </section>

      <section className="smesh-card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0b1220]">
          <CheckCircle className="h-5 w-5" />
          Detailed Answers
        </h2>
        <div className="mt-6 space-y-4">
          {data.answers.map((a: any) => (
            <div key={a.questionId} className="smesh-card-soft p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#0b1220]">{a.question}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs smesh-muted">
                    <span className="bg-[rgba(7,27,58,0.08)] px-2 py-1 rounded">{a.type}</span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {a.points} points
                    </span>
                    <span className="flex items-center gap-1">
                      Earned: {a.earnedPoints}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <div>
                    <span className="font-medium text-[#0b1220]">Your Answer:</span>
                    <div className="mt-1 font-mono text-xs bg-[rgba(7,27,58,0.02)] p-2 rounded break-words whitespace-pre-wrap">
                      {JSON.stringify(a.studentAnswer)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                  </div>
                  <div>
                    <span className="font-medium text-[#0b1220]">Correct Answer:</span>
                    <div className="mt-1 font-mono text-xs bg-[rgba(16,185,129,0.02)] p-2 rounded break-words whitespace-pre-wrap">
                      {JSON.stringify(a.correctAnswer)}
                    </div>
                  </div>
                </div>
                {a.explanation ? (
                  <div className="bg-[rgba(7,27,58,0.02)] p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                      </div>
                      <div>
                        <span className="font-medium text-[#0b1220] text-xs">Explanation:</span>
                        <div className="mt-1 text-xs text-[#5b6474]">{a.explanation}</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

