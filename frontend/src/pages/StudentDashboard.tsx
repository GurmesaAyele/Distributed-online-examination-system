import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  Paper,
  LinearProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
} from '@mui/material'
import { Logout, Upload, TrendingUp, Assignment, CheckCircle, Schedule, Block, Brightness4, Brightness7 } from '@mui/icons-material'
import { LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import '../styles/StudentDashboard.css'

const StudentDashboard = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [exams, setExams] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [allAttempts, setAllAttempts] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [feedbackForm, setFeedbackForm] = useState({
    exam: '',
    attempt: '',
    comment: '',
    rating: 5
  })
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false)
  const [selectedExamForFeedback, setSelectedExamForFeedback] = useState<any>(null)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })
  const [stats, setStats] = useState({
    totalExams: 0,
    completedExams: 0,
    bannedExams: 0,
    averageScore: 0,
    passRate: 0
  })
  const [chartData, setChartData] = useState<any>({
    performanceTrend: [],
    subjectPerformance: [],
    scoreDistribution: []
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogSeverity, setDialogSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info')

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
  }

  useEffect(() => {
    fetchData()
    fetchAnnouncements()
    fetchUnreadCount()
    fetchFeedbacks()
  }, [])

  const fetchData = async () => {
    try {
      const [examsRes, attemptsRes] = await Promise.all([
        api.get('/exams/'),
        api.get('/attempts/'),
      ])
      
      console.log('All exams from API:', examsRes.data)
      console.log('Exams count:', examsRes.data.length)
      console.log('All attempts:', attemptsRes.data)
      
      // Show all approved exams (including upcoming and past)
      const approvedExams = examsRes.data.filter((exam: any) => exam.status === 'approved')
      
      console.log('Approved exams:', approvedExams)
      console.log('Approved exams count:', approvedExams.length)
      
      setExams(approvedExams)
      
      // Store all attempts for status checking
      setAllAttempts(attemptsRes.data)
      
      // Get evaluated results for the Results tab
      const evaluatedResults = attemptsRes.data.filter((a: any) => a.status === 'evaluated')
      setResults(evaluatedResults)

      // Calculate stats
      const totalExams = examsRes.data.length
      const completedExams = evaluatedResults.length
      const bannedExams = attemptsRes.data.filter((a: any) => a.status === 'auto_submitted').length
      const averageScore = evaluatedResults.length > 0
        ? evaluatedResults.reduce((sum: number, r: any) => sum + r.percentage, 0) / evaluatedResults.length
        : 0
      const passedExams = evaluatedResults.filter((r: any) => r.percentage >= 40).length
      const passRate = completedExams > 0 ? (passedExams / completedExams) * 100 : 0

      setStats({ totalExams, completedExams, bannedExams, averageScore, passRate })

      // Performance trend
      const performanceTrend = evaluatedResults.slice(-6).map((r: any, index: number) => ({
        exam: `Exam ${index + 1}`,
        score: r.percentage,
        marks: r.obtained_marks
      }))

      // Subject performance (mock data - can be enhanced with real subject data)
      const subjectPerformance = [
        { subject: 'Math', score: 85, fullMark: 100 },
        { subject: 'Science', score: 78, fullMark: 100 },
        { subject: 'English', score: 92, fullMark: 100 },
        { subject: 'History', score: 88, fullMark: 100 },
        { subject: 'CS', score: 95, fullMark: 100 }
      ]

      // Score distribution
      const scoreRanges = [
        { range: '0-40', count: 0, color: '#FF8042' },
        { range: '41-60', count: 0, color: '#FFBB28' },
        { range: '61-80', count: 0, color: '#00C49F' },
        { range: '81-100', count: 0, color: '#0088FE' }
      ]

      evaluatedResults.forEach((r: any) => {
        if (r.percentage <= 40) scoreRanges[0].count++
        else if (r.percentage <= 60) scoreRanges[1].count++
        else if (r.percentage <= 80) scoreRanges[2].count++
        else scoreRanges[3].count++
      })

      setChartData({
        performanceTrend,
        subjectPerformance,
        scoreDistribution: scoreRanges.filter(r => r.count > 0)
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const showDialog = (title: string, message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setDialogTitle(title)
    setDialogMessage(message)
    setDialogSeverity(severity)
    setDialogOpen(true)
  }

  const handleUploadProfile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData()
      formData.append('profile_picture', e.target.files[0])
      
      try {
        const response = await api.post('/users/upload_profile_picture/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        
        // Update user in auth store with new profile picture
        if (response.data && user) {
          const updatedUser = { ...user, profile_picture: response.data.profile_picture }
          const { setAuth } = useAuthStore.getState()
          const token = useAuthStore.getState().token
          if (token) {
            setAuth(updatedUser, token)
          }
        }
        
        showDialog('Success', 'Profile picture uploaded successfully! Page will refresh...', 'success')
        setTimeout(() => window.location.reload(), 2000)
      } catch (error) {
        console.error('Error uploading profile:', error)
        showDialog('Error', 'Failed to upload profile picture. Please try again.', 'error')
      }
    }
  }

  const getExamStatus = (exam: any, attempts: any[]) => {
    // Check if student has completed this exam
    const completedAttempt = attempts.find((a: any) => 
      a.exam === exam.id && (a.status === 'submitted' || a.status === 'auto_submitted' || a.status === 'evaluated')
    )
    
    if (completedAttempt) {
      // Check if auto-submitted due to violations (banned)
      if (completedAttempt.status === 'auto_submitted') {
        return { status: 'banned', label: 'Banned', color: 'error', attempt: completedAttempt }
      }
      // Regular completion
      return { status: 'completed', label: 'Completed', color: 'secondary', attempt: completedAttempt }
    }

    const now = new Date()
    const startTime = new Date(exam.start_time)
    const endTime = new Date(exam.end_time)

    if (now < startTime) {
      return { status: 'upcoming', label: 'Upcoming', color: 'info', attempt: null }
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', label: 'Active Now', color: 'success', attempt: null }
    } else {
      return { status: 'expired', label: 'Expired', color: 'error', attempt: null }
    }
  }

  const getCountdown = (exam: any) => {
    const now = new Date()
    const startTime = new Date(exam.start_time)
    const endTime = new Date(exam.end_time)

    if (now < startTime) {
      // Countdown to start
      const diff = startTime.getTime() - now.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (days > 0) return `Starts in ${days}d ${hours}h`
      if (hours > 0) return `Starts in ${hours}h ${minutes}m`
      return `Starts in ${minutes}m`
    } else if (now >= startTime && now <= endTime) {
      // Time remaining
      const diff = endTime.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) return `${hours}h ${minutes}m remaining`
      return `${minutes}m remaining`
    } else {
      return 'Exam expired'
    }
  }

  const canStartExam = (exam: any) => {
    const now = new Date()
    const startTime = new Date(exam.start_time)
    const endTime = new Date(exam.end_time)
    return now >= startTime && now <= endTime
  }

  const startExam = (examId: number) => {
    navigate(`/exam/${examId}`)
  }

  const downloadCertificate = async (attemptId: number) => {
    try {
      const response = await api.get(`/attempts/${attemptId}/download_certificate/`)
      window.open(`http://localhost:8000${response.data.pdf_url}`, '_blank')
    } catch (error) {
      console.error('Error downloading certificate:', error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements/')
      setAnnouncements(response.data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/announcements/unread_count/')
      setUnreadCount(response.data.unread_count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const handleMarkAsRead = async (announcementId: number) => {
    try {
      await api.post(`/announcements/${announcementId}/mark_read/`)
      fetchUnreadCount()
      fetchAnnouncements()
    } catch (error) {
      console.error('Error marking announcement as read:', error)
    }
  }

  const fetchFeedbacks = async () => {
    try {
      const response = await api.get('/feedbacks/')
      setFeedbacks(response.data)
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    }
  }

  const handleOpenFeedbackDialog = (exam: any, attempt: any) => {
    setSelectedExamForFeedback(exam)
    setFeedbackForm({
      exam: exam.id,
      attempt: attempt?.id || '',
      comment: '',
      rating: 5
    })
    setOpenFeedbackDialog(true)
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackForm.comment.trim()) {
      showDialog('Error', 'Please write a comment', 'error')
      return
    }

    try {
      await api.post('/feedbacks/', feedbackForm)
      setOpenFeedbackDialog(false)
      setFeedbackForm({ exam: '', attempt: '', comment: '', rating: 5 })
      showDialog('Success', 'Feedback submitted successfully!', 'success')
      fetchFeedbacks()
    } catch (error: any) {
      console.error('Error submitting feedback:', error)
      const errorMsg = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Failed to submit feedback'
      showDialog('Error', errorMsg, 'error')
    }
  }

  return (
    <Box sx={{ bgcolor: darkMode ? '#121212' : '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: darkMode ? '#1e1e1e' : '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Student Dashboard
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-upload"
            type="file"
            onChange={handleUploadProfile}
          />
          <label htmlFor="profile-upload">
            <IconButton color="inherit" component="span">
              <Upload />
            </IconButton>
          </label>
          <Avatar src={user?.profile_picture} sx={{ mx: 2 }} />
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, color: darkMode ? '#fff' : 'inherit' }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.first_name}!
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Exams</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.totalExams}</Typography>
                  </Box>
                  <Assignment sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Completed</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.completedExams}</Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Banned</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.bannedExams}</Typography>
                  </Box>
                  <Block sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Average Score</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.averageScore.toFixed(1)}%</Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Pass Rate</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.passRate.toFixed(0)}%</Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Navigation */}
        <Tabs 
          value={activeTab} 
          onChange={(_, v) => setActiveTab(v)} 
          sx={{ 
            mb: 3, 
            mt: 4, 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': { color: darkMode ? '#bbb' : 'inherit' },
            '& .Mui-selected': { color: darkMode ? '#90caf9' : '#1976d2' }
          }}
        >
          <Tab label="My Exams" />
          <Tab label="Analytics" />
          <Tab label="Results" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Announcements
                {unreadCount > 0 && (
                  <Chip 
                    label={unreadCount} 
                    size="small" 
                    color="error" 
                    sx={{ height: 20, minWidth: 20, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            } 
          />
          <Tab label="Feedback" />
        </Tabs>

        {/* Tab 0: My Exams */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Available Exams
            </Typography>
        <Grid container spacing={3}>
          {exams.map((exam) => {
            const examStatus = getExamStatus(exam, allAttempts)
            const isCompleted = examStatus.status === 'completed'
            const isBanned = examStatus.status === 'banned'
            
            return (
              <Grid item xs={12} md={6} key={exam.id}>
                <Card sx={{ 
                  border: examStatus.status === 'active' ? '2px solid #4caf50' : 
                         isBanned ? '2px solid #d32f2f' :
                         isCompleted ? '2px solid #9c27b0' : '1px solid #ddd',
                  boxShadow: examStatus.status === 'active' || isCompleted || isBanned ? 3 : 1,
                  opacity: isCompleted || isBanned ? 0.9 : 1,
                  bgcolor: darkMode ? (isBanned ? '#3d1f1f' : '#1e1e1e') : (isBanned ? '#ffebee' : 'white'),
                  color: darkMode ? '#fff' : 'inherit'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6">{exam.title}</Typography>
                      <Chip
                        label={examStatus.label}
                        color={examStatus.color as any}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    
                    <Typography color="textSecondary" gutterBottom>
                      {exam.subject_name}
                    </Typography>

                    {isBanned ? (
                      <>
                        <Box sx={{ my: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1, border: '1px solid #d32f2f' }}>
                          <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                            ⏰ {getCountdown(exam)}
                          </Typography>
                        </Box>
                        <Box sx={{ my: 2, p: 2, bgcolor: '#ffcdd2', borderRadius: 1, border: '2px solid #d32f2f' }}>
                          <Typography variant="h6" color="error" sx={{ fontWeight: 'bold', mb: 1 }}>
                            🚫 EXAM BANNED
                          </Typography>
                          {examStatus.attempt && (
                            <>
                              <Typography variant="body2" sx={{ mb: 0.5, color: '#c62828' }}>
                                ⚠️ Auto-submitted due to violations
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                📅 Submitted: {new Date(examStatus.attempt.end_time).toLocaleString()}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                🚨 Violations: {examStatus.attempt.tab_switch_count + examStatus.attempt.copy_paste_count}
                              </Typography>
                              {examStatus.attempt.status === 'evaluated' && (
                                <>
                                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    📊 Score: {examStatus.attempt.obtained_marks}/{examStatus.attempt.total_marks}
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                                    🎯 Percentage: {examStatus.attempt.percentage.toFixed(2)}%
                                  </Typography>
                                </>
                              )}
                              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: '#c62828' }}>
                                ❌ Cannot retake this exam
                              </Typography>
                            </>
                          )}
                        </Box>
                      </>
                    ) : isCompleted ? (
                      <Box sx={{ my: 2, p: 2, bgcolor: '#f3e5f5', borderRadius: 1, border: '1px solid #9c27b0' }}>
                        <Typography variant="h6" color="secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                          ✅ Exam Completed
                        </Typography>
                        {examStatus.attempt && (
                          <>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              📅 Completed: {new Date(examStatus.attempt.end_time).toLocaleString()}
                            </Typography>
                            {examStatus.attempt.status === 'evaluated' && (
                              <>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  📊 Score: {examStatus.attempt.obtained_marks}/{examStatus.attempt.total_marks}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: examStatus.attempt.percentage >= 40 ? '#4caf50' : '#f44336' }}>
                                  🎯 Percentage: {examStatus.attempt.percentage.toFixed(2)}%
                                </Typography>
                              </>
                            )}
                            {examStatus.attempt.status === 'submitted' && (
                              <Typography variant="body2" color="textSecondary">
                                ⏳ Awaiting evaluation...
                              </Typography>
                            )}
                          </>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ my: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                          ⏰ {getCountdown(exam)}
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      📅 Start: {new Date(exam.start_time).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      🏁 End: {new Date(exam.end_time).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      ⏱️ Duration: {exam.duration_minutes} minutes
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      📊 Total Marks: {exam.total_marks}
                    </Typography>

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => {
                        if (isBanned) {
                          showDialog(
                            '🚫 Exam Banned',
                            'You are banned from this exam due to violations. You exceeded the maximum number of violations (3) during the exam. This exam cannot be retaken.',
                            'error'
                          )
                        } else if (isCompleted) {
                          showDialog(
                            '✅ Exam Already Completed',
                            'You have already completed this exam. You cannot retake a completed exam.',
                            'info'
                          )
                        } else if (!canStartExam(exam)) {
                          if (examStatus.status === 'upcoming') {
                            showDialog(
                              '🔒 Exam Not Started',
                              `This exam has not started yet. It will begin on ${new Date(exam.start_time).toLocaleString()}.`,
                              'info'
                            )
                          } else if (examStatus.status === 'expired') {
                            showDialog(
                              '🔒 Exam Expired',
                              `This exam has expired. It ended on ${new Date(exam.end_time).toLocaleString()}.`,
                              'warning'
                            )
                          }
                        } else {
                          startExam(exam.id)
                        }
                      }}
                      disabled={false}
                      color={isBanned ? 'error' : isCompleted ? 'secondary' : examStatus.status === 'active' ? 'success' : 'primary'}
                    >
                      {isBanned ? '🚫 Banned' : 
                       isCompleted ? '✅ Completed' : 
                       examStatus.status === 'upcoming' ? '🔒 Upcoming' : 
                       examStatus.status === 'active' ? '▶️ Start Exam' : 
                       '🔒 Expired'}
                    </Button>

                    {isCompleted && !isBanned && (
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={() => handleOpenFeedbackDialog(exam, examStatus.attempt)}
                      >
                        💬 Leave Feedback
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
          </Box>
        )}

        {/* Tab 1: Analytics */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>Performance Analytics</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                  <Typography variant="h6" gutterBottom>Performance Trend</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.performanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="exam" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} name="Score %" />
                      <Line type="monotone" dataKey="marks" stroke="#82ca9d" strokeWidth={2} name="Marks" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                  <Typography variant="h6" gutterBottom>Score Distribution</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.scoreDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ range, count }) => `${range}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {chartData.scoreDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                  <Typography variant="h6" gutterBottom>Subject Performance Analysis</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={chartData.subjectPerformance}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Your Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 2: Results & History */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Exam Results & History
            </Typography>
            
            {results.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                <Typography variant="h6" color="textSecondary">
                  No exam results yet
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Complete an exam to see your results here
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {results.map((result) => (
                  <Grid item xs={12} md={6} key={result.id}>
                    <Card sx={{ 
                      border: result.percentage >= 40 ? '2px solid #4caf50' : '2px solid #f44336',
                      boxShadow: 3,
                      bgcolor: darkMode ? '#1e1e1e' : 'white',
                      color: darkMode ? '#fff' : 'inherit'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6">{result.exam_title}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Completed: {new Date(result.end_time).toLocaleDateString()}
                            </Typography>
                          </Box>
                          {user?.profile_picture && (
                            <Avatar src={user.profile_picture} sx={{ width: 50, height: 50 }} />
                          )}
                        </Box>
                        
                        <Box sx={{ my: 2 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Score: {result.obtained_marks} / {result.total_marks}
                          </Typography>
                          <Typography variant="h4" color={result.percentage >= 40 ? 'success.main' : 'error.main'} sx={{ fontWeight: 'bold' }}>
                            {result.percentage.toFixed(2)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={result.percentage} 
                            sx={{ 
                              height: 10, 
                              borderRadius: 5, 
                              mt: 1,
                              bgcolor: 'grey.300',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: result.percentage >= 40 ? 'success.main' : 'error.main'
                              }
                            }} 
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip
                            label={result.percentage >= 40 ? '✓ PASSED' : '✗ FAILED'}
                            color={result.percentage >= 40 ? 'success' : 'error'}
                            sx={{ fontWeight: 'bold' }}
                          />
                          {result.tab_switch_count > 0 && (
                            <Chip
                              label={`${result.tab_switch_count} Violations`}
                              color="warning"
                              size="small"
                            />
                          )}
                        </Box>

                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          Duration: {result.exam?.duration_minutes || 'N/A'} minutes | 
                          Status: {result.status === 'auto_submitted' ? ' Auto-submitted' : ' Submitted'}
                        </Typography>

                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={() => downloadCertificate(result.id)}
                        >
                          Download Certificate
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Tab 3: Announcements */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Announcements
            </Typography>

            {announcements.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                <Typography variant="h6" color="textSecondary">
                  No announcements yet
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Check back later for updates
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {announcements.map((announcement) => (
                  <Grid item xs={12} key={announcement.id}>
                    <Card sx={{ 
                      bgcolor: darkMode ? '#1e1e1e' : 'white', 
                      color: darkMode ? '#fff' : 'inherit',
                      border: announcement.is_read ? '1px solid #ddd' : '2px solid #1976d2',
                      boxShadow: announcement.is_read ? 1 : 3
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6">{announcement.title}</Typography>
                              {!announcement.is_read && (
                                <Chip label="NEW" size="small" color="error" />
                              )}
                            </Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              From: {announcement.created_by_name} • {new Date(announcement.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                          {!announcement.is_read && (
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => handleMarkAsRead(announcement.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </Box>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {announcement.content}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Tab 4: Feedback */}
        {activeTab === 4 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
              My Feedback
            </Typography>

            {feedbacks.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                <Typography variant="h6" color="textSecondary">
                  No feedback submitted yet
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Complete an exam and leave feedback for your teacher
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {feedbacks.map((feedback) => (
                  <Grid item xs={12} key={feedback.id}>
                    <Card sx={{ 
                      bgcolor: darkMode ? '#1e1e1e' : 'white', 
                      color: darkMode ? '#fff' : 'inherit',
                      border: feedback.is_reviewed ? '2px solid #4caf50' : '1px solid #ddd'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6">{feedback.exam_title}</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              Submitted: {new Date(feedback.created_at).toLocaleString()}
                            </Typography>
                            {feedback.rating && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                <Typography variant="body2">Rating:</Typography>
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} style={{ color: i < feedback.rating ? '#ffc107' : '#ddd' }}>★</span>
                                ))}
                              </Box>
                            )}
                          </Box>
                          <Chip 
                            label={feedback.is_reviewed ? 'Reviewed' : 'Pending'} 
                            color={feedback.is_reviewed ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Your Comment:</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2, p: 2, bgcolor: darkMode ? '#2a2a2a' : '#f5f5f5', borderRadius: 1 }}>
                          {feedback.comment}
                        </Typography>

                        {feedback.teacher_response && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: darkMode ? '#1a3a1a' : '#e8f5e9', borderRadius: 1, border: '1px solid #4caf50' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#4caf50' }}>
                              Teacher's Response:
                            </Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                              {feedback.teacher_response}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Container>

      {/* Feedback Dialog */}
      <Dialog open={openFeedbackDialog} onClose={() => setOpenFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Leave Feedback for {selectedExamForFeedback?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Share your thoughts about this exam with your teacher
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 1 }}>Rating (Optional):</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton
                key={star}
                onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                sx={{ p: 0.5 }}
              >
                <span style={{ fontSize: '2rem', color: star <= feedbackForm.rating ? '#ffc107' : '#ddd' }}>★</span>
              </IconButton>
            ))}
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Comment"
            value={feedbackForm.comment}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
            placeholder="Share your experience, suggestions, or concerns about this exam..."
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFeedbackDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitFeedback} variant="contained" color="primary">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for messages */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Alert severity={dialogSeverity} sx={{ mt: 2 }}>
            {dialogMessage}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StudentDashboard
