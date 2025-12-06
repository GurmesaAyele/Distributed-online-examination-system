import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import '../styles/Login.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [systemSettings, setSystemSettings] = useState({
    logo: '',
    welcome_text: 'Welcome to Online Exam Platform'
  })
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    fetchSystemSettings()
  }, [])

  const fetchSystemSettings = async () => {
    try {
      const response = await api.get('/system-settings/')
      if (response.data) {
        setSystemSettings(response.data)
      }
    } catch (error) {
      console.log('Using default settings')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login/', { username, password })
      setAuth(response.data.user, response.data.access)
      navigate(`/${response.data.user.role}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Container maxWidth="sm">
        <div className="login-content">
          {/* Logo at top-center of page */}
          {systemSettings.logo && (
            <div className="login-logo-container">
              <img 
                src={`http://localhost:8000${systemSettings.logo}`} 
                alt="System Logo" 
                className="login-logo"
              />
            </div>
          )}

          <Paper elevation={3} className="login-paper">
            <Typography component="h1" variant="h5" align="center" className="login-title">
              {systemSettings.welcome_text}
            </Typography>
            <Typography component="h2" variant="body1" align="center" className="login-subtitle">
              Login
            </Typography>

            {error && (
              <Alert severity="error" className="login-alert">
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} className="login-form">
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                size="small"
                className="login-textfield"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="small"
                className="login-textfield"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="login-button"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Typography variant="caption" className="login-footer-text">
                Contact your administrator for account access
              </Typography>
            </Box>
          </Paper>
        </div>
      </Container>
    </div>
  )
}

export default Login
