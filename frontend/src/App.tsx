import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './store/auth'
import { AppShell } from './components/layout/AppShell'
import { RequireAuth } from './components/auth/RequireAuth'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { TeacherHome } from './pages/TeacherHome'
import { StudentHome } from './pages/StudentHome'
import { StudentSessionsPage } from './pages/StudentSessionsPage'
import { StudentTakeSessionPage } from './pages/StudentTakeSessionPage'
import { StudentResultsPage } from './pages/StudentResultsPage'
import { StudentSettingsPage } from './pages/StudentSettingsPage'
import { StudentClassPage } from './pages/StudentClassPage'
import { TeacherClassPage } from './pages/TeacherClassPage'
import { TeacherExamPage } from './pages/TeacherExamPage'
import { TeacherSessionPage } from './pages/TeacherSessionPage'

function App() {
  const auth = useAuth()

  useEffect(() => {
    void auth.hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Routes>
      {/* Public routes without AppShell */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated routes with AppShell */}
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route element={<RequireAuth role="TEACHER" />}>
            <Route path="/teacher" element={<TeacherHome />} />
            <Route path="/teacher/classes/:classId" element={<TeacherClassPage />} />
            <Route path="/teacher/exams/:examId" element={<TeacherExamPage />} />
            <Route path="/teacher/sessions/:sessionId" element={<TeacherSessionPage />} />
          </Route>

          <Route element={<RequireAuth role="STUDENT" />}>
            <Route path="/student" element={<StudentHome />} />
            <Route path="/student/class" element={<StudentClassPage />} />
            <Route path="/student/sessions" element={<StudentSessionsPage />} />
            <Route path="/student/sessions/:sessionId" element={<StudentTakeSessionPage />} />
            <Route path="/student/results/:sessionId" element={<StudentResultsPage />} />
            <Route path="/student/settings" element={<StudentSettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback route for authenticated users */}
      <Route element={<RequireAuth />}>
        <Route path="/teacher" element={<Navigate to="/teacher" replace />} />
        <Route path="/student" element={<Navigate to="/student" replace />} />
      </Route>

      {/* Fallback for unauthenticated users */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
