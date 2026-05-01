import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './store/auth'
import { AppShell } from './components/layout/AppShell'
import { RequireAuth } from './components/auth/RequireAuth'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { TeacherHome } from './pages/TeacherHome'
import { TeacherClassesPage } from './pages/TeacherClassesPage'
import { TeacherCreateClassPage } from './pages/TeacherCreateClassPage'
import { TeacherSettingsPage } from './pages/TeacherSettingsPage'
import { StudentHome } from './pages/StudentHome'
import { StudentSessionsPage } from './pages/StudentSessionsPage'
import { StudentTakeSessionPage } from './pages/StudentTakeSessionPage'
import { StudentResultsPage } from './pages/StudentResultsPage'
import { StudentSettingsPage } from './pages/StudentSettingsPage'
import { StudentClassPage } from './pages/StudentClassPage'
import { TeacherClassPage } from './pages/TeacherClassPage'
import { TeacherExamPage } from './pages/TeacherExamPage'
import { TeacherSessionPage } from './pages/TeacherSessionPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminCreateUserPage } from './pages/AdminCreateUserPage'
import { RequireAdmin } from './components/admin/AdminAuth'

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

      {/* Secret Admin Route */}
      <Route path="/admin" element={
        <RequireAdmin>
          <AdminDashboard />
        </RequireAdmin>
      } />
      <Route path="/admin/create-user" element={
        <RequireAdmin>
          <AdminCreateUserPage />
        </RequireAdmin>
      } />

      {/* Authenticated routes with AppShell */}
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route element={<RequireAuth role="TEACHER" />}>
            <Route path="/teacher" element={<TeacherHome />} />
            <Route path="/teacher/classes" element={<TeacherClassesPage />} />
            <Route path="/teacher/create-class" element={<TeacherCreateClassPage />} />
            <Route path="/teacher/settings" element={<TeacherSettingsPage />} />
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


      {/* Fallback for unauthenticated users */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
