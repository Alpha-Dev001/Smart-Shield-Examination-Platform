import { create } from 'zustand'
import { api } from '../lib/api'

export type Role = 'TEACHER' | 'STUDENT'

export type Me = {
  id: string
  email: string
  role: Role
  classId: string | null
  createdAt: string
}

type AuthState = {
  accessToken: string | null
  user: Me | null
  isHydrated: boolean
  setToken: (token: string | null) => void
  setUser: (user: Me | null) => void
  hydrate: () => Promise<void>
  login: (payload: { email: string; password: string }) => Promise<void>
  register: (payload: { email: string; password: string; role: Role }) => Promise<void>
  logout: () => void
}

export const useAuth = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem('access_token'),
  user: null,
  isHydrated: false,

  setToken: (token) => {
    if (token) localStorage.setItem('access_token', token)
    else localStorage.removeItem('access_token')
    set({ accessToken: token })
  },

  setUser: (user) => set({ user }),

  hydrate: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ accessToken: null, user: null, isHydrated: true })
      return
    }
    set({ accessToken: token })
    try {
      const res = await api.get<Me>('/auth/me')
      set({ user: res.data, isHydrated: true })
    } catch {
      localStorage.removeItem('access_token')
      set({ accessToken: null, user: null, isHydrated: true })
    }
  },

  login: async ({ email, password }) => {
    const res = await api.post<{ access_token: string; user: any }>('/auth/login', {
      email,
      password,
    })
    get().setToken(res.data.access_token)
    await get().hydrate()
  },

  register: async ({ email, password, role }) => {
    const res = await api.post<{ access_token: string; user: any }>(
      '/auth/register',
      {
        email,
        password,
        role,
      },
    )
    get().setToken(res.data.access_token)
    await get().hydrate()
  },

  logout: () => {
    localStorage.removeItem('access_token')
    set({ accessToken: null, user: null })
  },
}))

