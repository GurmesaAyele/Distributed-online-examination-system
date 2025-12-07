import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-logout on 401 if NOT on the login page
    // This allows login errors to be handled by the Login component
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
