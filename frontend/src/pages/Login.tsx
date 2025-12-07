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
      console.error('Login error:', err)
      if (err.response?.status === 401) {
        setError('Invalid username or password. Please try again.')
      } else if (err.response?.status === 403) {
        setError(err.response?.data?.error || 'Your account has been deactivated. Please contact the administrator.')
      } else {
        setError(err.response?.data?.error || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        py: 2
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo at top-center of page */}
          {systemSettings.logo && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <img 
                src={`http://localhost:8000${systemSettings.logo}`} 
                alt="System Logo" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '80px', 
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </Box>
          )}

          <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              {systemSettings.welcome_text}
            </Typography>
            <Typography component="h2" variant="body1" align="center" color="textSecondary" gutterBottom>
              Login
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2, 
                  '& .MuiAlert-message': { 
                    fontWeight: 500 
                  }
                }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 1 }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Typography variant="caption" align="center" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                Contact your administrator for account access
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}

export default Login
