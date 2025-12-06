import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Card, CardContent, Button, Grid, AppBar, Toolbar, IconButton, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Tabs, Tab
} from '@mui/material'
import { Logout, Visibility, School, Assessment, People, TrendingUp, Brightness4, Brightness7 } from '@mui/icons-material'
import { BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import '../styles/TeacherDashboard.css'

const TeacherDashboard = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })
  const [exams, setExams] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false)
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [studentsStatus, setStudentsStatus] = useState<any[]>([])
  const [examForm, setExamForm] = useState({
    title: '', 
    description: '', 
    subject: '', 
    department: '',
    course: '',
    custom_department: '',
    custom_course: '',
    additional_info: '',
    duration_minutes: 60, 
    total_marks: 100,
    passing_marks: 40, 
    negative_marking: false, 
    negative_marks_per_question: 0,
    shuffle_questions: true, 
    start_time: '', 
    end_time: ''
  })
  const [questions, setQuestions] = useState<any[]>([])
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([])
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [questionForm, setQuestionForm] = useState({
    question_text: '', question_type: 'mcq', marks: 1, option_a: '', option_b: '',
    option_c: '', option_d: '', correct_answer: '', explanation: ''
  })
  const [stats, setStats] = useState({
    totalExams: 0,
    totalStudents: 0,
    averageScore: 0,
    pendingGrading: 0
  })
  const [chartData, setChartData] = useState<any>({
    examPerformance: [],
    studentProgress: [],
    examStatusDistribution: [],
    subjectWisePerformance: []
  })

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [examsRes, subjectsRes, attemptsRes, deptsRes, coursesRes] = await Promise.all([
        api.get('/exams/'),
        api.get('/subjects/'),
        api.get('/attempts/'),
        api.get('/departments/'),
        api.get('/courses/')
      ])
      setExams(examsRes.data)
      setSubjects(subjectsRes.data)
      setDepartments(deptsRes.data)
      setCourses(coursesRes.data)

      // Calculate stats
      const totalExams = examsRes.data.length
      const evaluatedAttempts = attemptsRes.data.filter((a: any) => a.status === 'evaluated')
      const totalStudents = new Set(attemptsRes.data.map((a: any) => a.student)).size
      const averageScore = evaluatedAttempts.length > 0
        ? evaluatedAttempts.reduce((sum: number, a: any) => sum + a.percentage, 0) / evaluatedAttempts.length
        : 0
      const pendingGrading = attemptsRes.data.filter((a: any) => a.status === 'submitted').length

      setStats({ totalExams, totalStudents, averageScore, pendingGrading })

      // Exam performance data
      const examPerformance = examsRes.data.slice(0, 5).map((exam: any) => {
        const examAttempts = attemptsRes.data.filter((a: any) => a.exam === exam.id && a.status === 'evaluated')
        const avgScore = examAttempts.length > 0
          ? examAttempts.reduce((sum: number, a: any) => sum + a.percentage, 0) / examAttempts.length
          : 0
        return {
          name: exam.title.substring(0, 15) + '...',
          average: avgScore.toFixed(1),
          students: examAttempts.length
        }
      })

      // Exam status distribution
      const statusCount = examsRes.data.reduce((acc: any, exam: any) => {
        acc[exam.status] = (acc[exam.status] || 0) + 1
        return acc
      }, {})

      const examStatusDistribution = Object.keys(statusCount).map(status => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: statusCount[status]
      }))

      // Student progress (mock data)
      const studentProgress = [
        { week: 'Week 1', completed: 12, pending: 8, average: 75 },
        { week: 'Week 2', completed: 15, pending: 5, average: 78 },
        { week: 'Week 3', completed: 18, pending: 2, average: 82 },
        { week: 'Week 4', completed: 20, pending: 0, average: 85 }
      ]

      // Subject-wise performance
      const subjectWisePerformance = subjectsRes.data.slice(0, 5).map((subject: any) => ({
        subject: subject.name,
        students: Math.floor(Math.random() * 50) + 20,
        avgScore: Math.floor(Math.random() * 30) + 70
      }))

      setChartData({
        examPerformance,
        studentProgress,
        examStatusDistribution,
        subjectWisePerformance
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handlePdfUpload = async (file: File) => {
    setUploadingPdf(true)
    const formData = new FormData()
    formData.append('pdf_file', file)

    try {
      const response = await api.post('/questions/parse_pdf/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setParsedQuestions(response.data.questions)
      alert(`✅ Successfully extracted ${response.data.count} questions from PDF!\nReview and edit them below, then click "Create Exam with Questions"`)
    } catch (error: any) {
      console.error('Error parsing PDF:', error)
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to parse PDF'
      alert(`❌ ${errorMsg}`)
    } finally {
      setUploadingPdf(false)
    }
  }

  const handleCreateExamWithQuestions = async () => {
    if (!examForm.title || !examForm.subject) {
      alert('❌ Please fill in exam title and subject')
      return
    }

    if (parsedQuestions.length === 0) {
      alert('❌ Please upload a PDF or add questions manually')
      return
    }

    // Validate and set default times if empty
    let examData = { ...examForm }
    
    if (!examData.start_time) {
      // Default to current time
      const now = new Date()
      examData.start_time = now.toISOString().slice(0, 16)
      console.log('Setting default start_time:', examData.start_time)
    }
    
    if (!examData.end_time) {
      // Default to 2 hours from now
      const twoHoursLater = new Date(Date.now() + 2 * 60 * 60 * 1000)
      examData.end_time = twoHoursLater.toISOString().slice(0, 16)
      console.log('Setting default end_time:', examData.end_time)
    }

    try {
      console.log('Creating exam with data:', examData)
      
      // Create exam first
      const examResponse = await api.post('/exams/', examData)
      console.log('Exam created:', examResponse.data)
      const examId = examResponse.data.id

      console.log('Adding questions:', parsedQuestions)
      
      // Then add questions
      await api.post('/questions/bulk_create/', {
        exam_id: examId,
        questions: parsedQuestions
      })

      console.log('Questions added successfully')

      alert(`✅ Exam created successfully with ${parsedQuestions.length} questions!\nStatus: Pending (awaiting admin approval)`)
      
      // Reset form
      setExamForm({
        title: '', description: '', subject: '', duration_minutes: 60, total_marks: 100,
        passing_marks: 40, negative_marking: false, negative_marks_per_question: 0,
        shuffle_questions: true, start_time: '', end_time: ''
      })
      setParsedQuestions([])
      fetchData()
    } catch (error: any) {
      console.error('Full error object:', error)
      console.error('Error response:', error.response)
      console.error('Error response data:', error.response?.data)
      
      let errorMessage = 'Unknown error'
      
      if (error.response?.data) {
        // Try to extract meaningful error message
        const data = error.response.data
        if (typeof data === 'string') {
          errorMessage = data
        } else if (data.detail) {
          errorMessage = data.detail
        } else if (data.error) {
          errorMessage = data.error
        } else if (data.message) {
          errorMessage = data.message
        } else {
          // Try to get first error from any field
          const firstKey = Object.keys(data)[0]
          if (firstKey && Array.isArray(data[firstKey])) {
            errorMessage = `${firstKey}: ${data[firstKey][0]}`
          } else if (firstKey) {
            errorMessage = `${firstKey}: ${data[firstKey]}`
          } else {
            errorMessage = JSON.stringify(data)
          }
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(`❌ Error creating exam:\n${errorMessage}\n\nCheck browser console for details.`)
    }
  }



  const handleAddQuestion = () => {
    setQuestions([...questions, { ...questionForm, order: questions.length + 1 }])
    setQuestionForm({
      question_text: '', question_type: 'mcq', marks: 1, option_a: '', option_b: '',
      option_c: '', option_d: '', correct_answer: '', explanation: ''
    })
  }

  const handleSaveQuestions = async () => {
    try {
      await api.post('/questions/bulk_create/', {
        exam_id: selectedExam.id,
        questions: questions
      })
      setOpenQuestionDialog(false)
      setQuestions([])
      alert('Questions added successfully')
    } catch (error) {
      console.error('Error saving questions:', error)
    }
  }

  const fetchStudentsStatus = async (examId: number) => {
    try {
      const response = await api.get(`/exams/${examId}/students_status/`)
      setStudentsStatus(response.data)
    } catch (error) {
      console.error('Error fetching students status:', error)
    }
  }

  const handleMonitorExam = (exam: any) => {
    setSelectedExam(exam)
    fetchStudentsStatus(exam.id)
    setActiveTab(2)
  }

  const handleDeleteExam = async (examId: number, examTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${examTitle}"?\n\nThis action cannot be undone and will delete all associated questions.`)) {
      try {
        await api.delete(`/exams/${examId}/`)
        alert('✅ Exam deleted successfully!')
        fetchData()
      } catch (error: any) {
        console.error('Error deleting exam:', error)
        alert('❌ Error deleting exam: ' + (error.response?.data?.detail || 'Unknown error'))
      }
    }
  }

  return (
    <Box sx={{ bgcolor: darkMode ? '#121212' : '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: darkMode ? '#1e1e1e' : '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Teacher Dashboard</Typography>
          <IconButton color="inherit" onClick={toggleDarkMode} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Avatar src={user?.profile_picture} sx={{ mx: 2 }} />
          <Typography variant="body1" sx={{ mr: 2 }}>{user?.first_name} {user?.last_name}</Typography>
          <IconButton color="inherit" onClick={() => { logout(); navigate('/login') }}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, color: darkMode ? '#fff' : 'inherit' }}>
        <Typography variant="h4" gutterBottom>Welcome, {user?.first_name}!</Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Exams</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.totalExams}</Typography>
                  </Box>
                  <School sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Students</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.totalStudents}</Typography>
                  </Box>
                  <People sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Avg Score</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.averageScore.toFixed(1)}%</Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Pending Grading</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.pendingGrading}</Typography>
                  </Box>
                  <Assessment sx={{ fontSize: 60, opacity: 0.3 }} />
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
          <Tab label="Create Exam" />
          <Tab label="Monitor Students" />
        </Tabs>

        {/* Tab 0: My Exams */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {exams.map((exam) => (
              <Grid item xs={12} md={6} key={exam.id}>
                <Card sx={{ bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Typography variant="h6">{exam.title}</Typography>
                      <Chip 
                        label={exam.status} 
                        color={exam.status === 'approved' ? 'success' : exam.status === 'pending' ? 'warning' : 'error'} 
                        size="small"
                      />
                    </Box>
                    <Typography color="textSecondary" gutterBottom>{exam.subject_name}</Typography>
                    <Typography variant="body2">Duration: {exam.duration_minutes} min</Typography>
                    <Typography variant="body2">Questions: {exam.questions_count}</Typography>
                    <Typography variant="body2">Start: {new Date(exam.start_time).toLocaleString()}</Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button size="small" variant="outlined" onClick={() => { setSelectedExam(exam); setOpenQuestionDialog(true) }}>
                        Add Questions
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => handleMonitorExam(exam)}>
                        Monitor
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleDeleteExam(exam.id, exam.title)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Tab 1: Analytics */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Analytics & Insights</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                  <Typography variant="h6" gutterBottom>
                    Exam Performance Overview
                  </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.examPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#8884d8" name="Avg Score %" />
                  <Bar dataKey="students" fill="#82ca9d" name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
              <Typography variant="h6" gutterBottom>
                Exam Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.examStatusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.examStatusDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
              <Typography variant="h6" gutterBottom>
                Student Progress Tracking
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData.studentProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="completed" fill="#8884d8" stroke="#8884d8" name="Completed" />
                  <Bar dataKey="pending" fill="#ffc658" name="Pending" />
                  <Line type="monotone" dataKey="average" stroke="#ff7300" strokeWidth={2} name="Avg Score" />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
              <Typography variant="h6" gutterBottom>
                Subject-wise Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.subjectWisePerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="subject" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#8884d8" name="Students" />
                  <Bar dataKey="avgScore" fill="#82ca9d" name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
          </Box>
        )}

        {/* Tab 2: Create Exam */}
        {activeTab === 2 && (
          <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
            <Typography variant="h5" gutterBottom>Create New Exam</Typography>
            
            {/* PDF Upload Section */}
            <Box sx={{ mb: 4, p: 3, border: '2px dashed #1976d2', borderRadius: 2, textAlign: 'center', bgcolor: darkMode ? '#1a2332' : '#f0f7ff', cursor: 'pointer' }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file && file.type === 'application/pdf') {
                  handlePdfUpload(file)
                }
              }}>
              <Typography variant="h6" gutterBottom color="primary">
                📄 Quick Import from PDF
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Drag and drop a PDF file here, or click to browse
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                Expected format: 1. Question? A) Option A B) Option B C) Option C D) Option D Answer: A
              </Typography>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="pdf-upload"
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handlePdfUpload(e.target.files[0])
                    e.target.value = '' // Reset input
                  }
                }}
              />
              <label htmlFor="pdf-upload">
                <Button 
                  variant="contained" 
                  component="span" 
                  size="large"
                  disabled={uploadingPdf}
                >
                  {uploadingPdf ? '⏳ Parsing PDF...' : '📎 Upload PDF'}
                </Button>
              </label>
              {parsedQuestions.length > 0 && (
                <Chip 
                  label={`✓ ${parsedQuestions.length} questions extracted`} 
                  color="success" 
                  sx={{ mt: 2 }}
                />
              )}
            </Box>

            {/* Exam Details Form */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>Exam Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Title" value={examForm.title} required
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth select label="Subject" value={examForm.subject} required
                  onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}>
                  {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </TextField>
              </Grid>
              
              {/* Department Selection */}
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  select 
                  label="Department (Optional)" 
                  value={examForm.department}
                  onChange={(e) => setExamForm({ ...examForm, department: e.target.value, custom_department: '' })}
                  helperText="Select from existing or type custom below"
                >
                  <MenuItem value="">None</MenuItem>
                  {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                </TextField>
              </Grid>
              
              {/* Custom Department Input */}
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="Custom Department" 
                  value={examForm.custom_department}
                  onChange={(e) => setExamForm({ ...examForm, custom_department: e.target.value, department: '' })}
                  helperText="Type custom department if not found above"
                  placeholder="e.g., Computer Science, Mathematics"
                />
              </Grid>
              
              {/* Course Selection */}
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  select 
                  label="Course (Optional)" 
                  value={examForm.course}
                  onChange={(e) => setExamForm({ ...examForm, course: e.target.value, custom_course: '' })}
                  helperText="Select from existing or type custom below"
                >
                  <MenuItem value="">None</MenuItem>
                  {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>
              </Grid>
              
              {/* Custom Course Input */}
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="Custom Course" 
                  value={examForm.custom_course}
                  onChange={(e) => setExamForm({ ...examForm, custom_course: e.target.value, course: '' })}
                  helperText="Type custom course if not found above"
                  placeholder="e.g., Data Structures, Calculus I"
                />
              </Grid>
              
              {/* Additional Information */}
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  multiline 
                  rows={2} 
                  label="Additional Information (Optional)" 
                  value={examForm.additional_info}
                  onChange={(e) => setExamForm({ ...examForm, additional_info: e.target.value })}
                  helperText="Any other useful information for the exam (semester, year, section, etc.)"
                  placeholder="e.g., Semester 1, Year 2024, Section A"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Description" value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth type="number" label="Duration (min)" value={examForm.duration_minutes}
                  onChange={(e) => setExamForm({ ...examForm, duration_minutes: parseInt(e.target.value) })} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth type="number" label="Total Marks" value={examForm.total_marks}
                  onChange={(e) => setExamForm({ ...examForm, total_marks: parseInt(e.target.value) })} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth type="number" label="Passing Marks" value={examForm.passing_marks}
                  onChange={(e) => setExamForm({ ...examForm, passing_marks: parseInt(e.target.value) })} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth select label="Negative Marking" value={examForm.negative_marking}
                  onChange={(e) => setExamForm({ ...examForm, negative_marking: e.target.value === 'true' })}>
                  <MenuItem value="false">No</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  type="datetime-local" 
                  label="Start Time" 
                  value={examForm.start_time}
                  onChange={(e) => setExamForm({ ...examForm, start_time: e.target.value })} 
                  InputLabelProps={{ shrink: true }}
                  helperText="Leave empty for current time"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  type="datetime-local" 
                  label="End Time" 
                  value={examForm.end_time}
                  onChange={(e) => setExamForm({ ...examForm, end_time: e.target.value })} 
                  InputLabelProps={{ shrink: true }}
                  helperText="Leave empty for 2 hours from now"
                />
              </Grid>
            </Grid>

            {/* Parsed Questions Display */}
            {parsedQuestions.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Extracted Questions ({parsedQuestions.length})
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Review and edit questions below. Click on any field to modify.
                </Typography>
                {parsedQuestions.map((q, index) => (
                  <Card key={index} sx={{ mb: 2, p: 2, bgcolor: darkMode ? '#2a2a2a' : '#f9f9f9', border: '1px solid #ddd', color: darkMode ? '#fff' : 'inherit' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Question {index + 1}
                      </Typography>
                      <Chip 
                        label={`Correct: ${q.correct_answer || 'A'}`} 
                        color="primary" 
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Question Text"
                          value={q.question_text}
                          onChange={(e) => {
                            const updated = [...parsedQuestions]
                            updated[index].question_text = e.target.value
                            setParsedQuestions(updated)
                          }}
                          multiline
                          rows={2}
                        />
                      </Grid>
                      {q.question_type === 'mcq' && (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Option A"
                              value={q.option_a}
                              onChange={(e) => {
                                const updated = [...parsedQuestions]
                                updated[index].option_a = e.target.value
                                setParsedQuestions(updated)
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Option B"
                              value={q.option_b}
                              onChange={(e) => {
                                const updated = [...parsedQuestions]
                                updated[index].option_b = e.target.value
                                setParsedQuestions(updated)
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Option C"
                              value={q.option_c}
                              onChange={(e) => {
                                const updated = [...parsedQuestions]
                                updated[index].option_c = e.target.value
                                setParsedQuestions(updated)
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Option D"
                              value={q.option_d}
                              onChange={(e) => {
                                const updated = [...parsedQuestions]
                                updated[index].option_d = e.target.value
                                setParsedQuestions(updated)
                              }}
                            />
                          </Grid>
                        </>
                      )}
                      <Grid item xs={6} md={3}>
                        <TextField
                          fullWidth
                          select
                          label="Correct Answer"
                          value={q.correct_answer || 'A'}
                          onChange={(e) => {
                            const updated = [...parsedQuestions]
                            updated[index].correct_answer = e.target.value
                            setParsedQuestions(updated)
                          }}
                          SelectProps={{
                            native: false,
                          }}
                          helperText={`Selected: ${q.correct_answer || 'A'}`}
                          sx={{
                            '& .MuiSelect-select': {
                              fontWeight: 'bold',
                              color: '#1976d2'
                            }
                          }}
                        >
                          {q.question_type === 'mcq' ? (
                            <>
                              <MenuItem value="A">Option A</MenuItem>
                              <MenuItem value="B">Option B</MenuItem>
                              <MenuItem value="C">Option C</MenuItem>
                              <MenuItem value="D">Option D</MenuItem>
                            </>
                          ) : (
                            <>
                              <MenuItem value="True">True</MenuItem>
                              <MenuItem value="False">False</MenuItem>
                            </>
                          )}
                        </TextField>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Marks"
                          value={q.marks}
                          onChange={(e) => {
                            const updated = [...parsedQuestions]
                            updated[index].marks = parseInt(e.target.value)
                            setParsedQuestions(updated)
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {
                            const updated = parsedQuestions.filter((_, i) => i !== index)
                            setParsedQuestions(updated)
                          }}
                        >
                          Remove Question
                        </Button>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Box>
            )}

            {/* Create Button */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {parsedQuestions.length > 0 ? (
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={handleCreateExamWithQuestions}
                  sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
                >
                  ✓ Create Exam with {parsedQuestions.length} Questions
                </Button>
              ) : (
                <Button variant="outlined" disabled>
                  Upload PDF to create exam
                </Button>
              )}
              {parsedQuestions.length > 0 && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    if (window.confirm('Clear all parsed questions?')) {
                      setParsedQuestions([])
                    }
                  }}
                >
                  Clear All Questions
                </Button>
              )}
            </Box>
          </Paper>
        )}

        {/* Tab 3: Monitor Students */}
        {activeTab === 3 && selectedExam && (
          <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
            <Typography variant="h5" gutterBottom>Monitor: {selectedExam.title}</Typography>
            <Button onClick={() => fetchStudentsStatus(selectedExam.id)} sx={{ mb: 2 }}>Refresh</Button>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Violations</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentsStatus.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell>{student.student_name}</TableCell>
                      <TableCell>
                        <Chip label={student.is_online ? 'Online' : 'Offline'}
                          color={student.is_online ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>{student.progress} questions</TableCell>
                      <TableCell>
                        <Chip label={student.violations} color={student.violations > 0 ? 'error' : 'default'} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>

      <Dialog open={openQuestionDialog} onClose={() => setOpenQuestionDialog(false)} maxWidth="md" fullWidth>

        <DialogTitle>Add Questions to {selectedExam?.title}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Question Text" value={questionForm.question_text}
                onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Type" value={questionForm.question_type}
                onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}>
                <MenuItem value="mcq">Multiple Choice</MenuItem>
                <MenuItem value="subjective">Subjective</MenuItem>
                <MenuItem value="true_false">True/False</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Marks" value={questionForm.marks}
                onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) })} />
            </Grid>
            {questionForm.question_type === 'mcq' && (
              <>
                <Grid item xs={6}>
                  <TextField fullWidth label="Option A" value={questionForm.option_a}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Option B" value={questionForm.option_b}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Option C" value={questionForm.option_c}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Option D" value={questionForm.option_d}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })} />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <TextField fullWidth label="Correct Answer" value={questionForm.correct_answer}
                onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" onClick={handleAddQuestion}>Add Question</Button>
            </Grid>
          </Grid>
          <Typography variant="h6" sx={{ mt: 3 }}>Added Questions: {questions.length}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuestionDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveQuestions} variant="contained">Save All Questions</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TeacherDashboard
