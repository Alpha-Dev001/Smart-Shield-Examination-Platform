import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg =
      (err.response?.data as any)?.message ??
      err.response?.statusText ??
      err.message
    return Array.isArray(msg) ? msg.join(', ') : String(msg)
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

