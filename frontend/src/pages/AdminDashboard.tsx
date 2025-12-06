import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Card, CardContent, Button, Grid, AppBar, Toolbar, IconButton, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Switch, FormControlLabel, Tabs, Tab
} from '@mui/material'
import { Logout, Add, Edit, Delete, CheckCircle, Cancel, TrendingUp, People, School, Assessment, Brightness4, Brightness7 } from '@mui/icons-material'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'

const AdminDashboard = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })
  const [users, setUsers] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [openUserDialog, setOpenUserDialog] = useState(false)
  const [openDeptDialog, setOpenDeptDialog] = useState(false)
  const [openCourseDialog, setOpenCourseDialog] = useState(false)
  const [openSubjectDialog, setOpenSubjectDialog] = useState(false)
  const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false)
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [resetPasswordUser, setResetPasswordUser] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [systemSettings, setSystemSettings] = useState({
    logo: '',
    welcome_text: 'Welcome to Online Exam Platform'
  })

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
  }

  const fetchSystemSettings = async () => {
    try {
      const response = await api.get('/system-settings/')
      if (response.data) {
        setSystemSettings(response.data)
      }
    } catch (error) {
      console.log('No system settings found')
    }
  }

  const handleUpdateSystemSettings = async () => {
    try {
      await api.post('/system-settings/', { welcome_text: systemSettings.welcome_text })
      alert('✅ Welcome text updated successfully!')
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('❌ Failed to update settings')
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData()
      formData.append('logo', e.target.files[0])
      
      try {
        const response = await api.post('/system-settings/upload_logo/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setSystemSettings({ ...systemSettings, logo: response.data.logo })
        alert('✅ Logo uploaded successfully!')
      } catch (error) {
        console.error('Error uploading logo:', error)
        alert('❌ Failed to upload logo')
      }
    }
  }
  const [userForm, setUserForm] = useState({
    username: '', email: '', password: '', first_name: '', last_name: '', role: 'student', department: '', is_active: true
  })
  const [deptForm, setDeptForm] = useState({ name: '', code: '' })
  const [courseForm, setCourseForm] = useState({ name: '', code: '', department: '' })
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', course: '', teacher: '' })
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', target_role: '' })
  const [stats, setStats] = useState({ total_users: 0, total_exams: 0, pending_exams: 0, active_students: 0 })
  const [chartData, setChartData] = useState<any>({
    usersByRole: [],
    examsByStatus: [],
    monthlyActivity: [],
    departmentStats: []
  })

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  useEffect(() => {
    fetchData()
    fetchSystemSettings()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, examsRes, deptsRes, coursesRes, subjectsRes] = await Promise.all([
        api.get('/users/'),
        api.get('/exams/'),
        api.get('/departments/'),
        api.get('/courses/'),
        api.get('/subjects/')
      ])
      setUsers(usersRes.data)
      setExams(examsRes.data)
      setDepartments(deptsRes.data)
      setCourses(coursesRes.data)
      setSubjects(subjectsRes.data)
      setStats({
        total_users: usersRes.data.length,
        total_exams: examsRes.data.length,
        pending_exams: examsRes.data.filter((e: any) => e.status === 'pending').length,
        active_students: usersRes.data.filter((u: any) => u.role === 'student' && u.is_active).length
      })

      // Prepare chart data
      const roleCount = usersRes.data.reduce((acc: any, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {})
      
      const usersByRole = Object.keys(roleCount).map(role => ({
        name: role.charAt(0).toUpperCase() + role.slice(1),
        value: roleCount[role]
      }))

      const statusCount = examsRes.data.reduce((acc: any, exam: any) => {
        acc[exam.status] = (acc[exam.status] || 0) + 1
        return acc
      }, {})

      const examsByStatus = Object.keys(statusCount).map(status => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: statusCount[status]
      }))

      // Monthly activity (mock data - you can replace with real data)
      const monthlyActivity = [
        { month: 'Jan', users: 45, exams: 12, attempts: 89 },
        { month: 'Feb', users: 52, exams: 15, attempts: 102 },
        { month: 'Mar', users: 61, exams: 18, attempts: 125 },
        { month: 'Apr', users: 58, exams: 20, attempts: 138 },
        { month: 'May', users: 67, exams: 22, attempts: 156 },
        { month: 'Jun', users: 73, exams: 25, attempts: 178 }
      ]

      // Department stats
      const deptCount = usersRes.data.reduce((acc: any, user: any) => {
        const dept = user.department || 'Unassigned'
        acc[dept] = (acc[dept] || 0) + 1
        return acc
      }, {})

      const departmentStats = Object.keys(deptCount).map(dept => ({
        department: dept,
        count: deptCount[dept]
      }))

      setChartData({
        usersByRole,
        examsByStatus,
        monthlyActivity,
        departmentStats
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleOpenUserDialog = (user?: any) => {
    if (user) {
      setEditingUser(user)
      setUserForm({
        username: user.username,
        email: user.email,
        password: '',
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        department: user.department || '',
        is_active: user.is_active
      })
    } else {
      setEditingUser(null)
      setUserForm({
        username: '', email: '', password: '', first_name: '', last_name: '', role: 'student', department: '', is_active: true
      })
    }
    setOpenUserDialog(true)
  }

  const handleCreateUser = async () => {
    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = { ...userForm }
        if (!updateData.password) {
          delete updateData.password // Don't update password if empty
        }
        await api.patch(`/users/${editingUser.id}/`, updateData)
        alert('User updated successfully!')
      } else {
        // Create new user
        await api.post('/users/', userForm)
        alert('User created successfully!')
      }
      setOpenUserDialog(false)
      setEditingUser(null)
      setUserForm({
        username: '', email: '', password: '', first_name: '', last_name: '', role: 'student', department: '', is_active: true
      })
      fetchData()
    } catch (error: any) {
      console.error('Error saving user:', error)
      console.error('Error response:', error.response?.data)
      const errorMsg = error.response?.data?.username?.[0] 
        || error.response?.data?.email?.[0] 
        || error.response?.data?.password?.[0]
        || error.response?.data?.detail
        || JSON.stringify(error.response?.data)
        || 'Error saving user. Please check all fields.'
      alert(errorMsg)
    }
  }

  const handleToggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      await api.patch(`/users/${userId}/`, { is_active: !isActive })
      fetchData()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}/`)
        fetchData()
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const handleOpenPasswordDialog = (user: any) => {
    setResetPasswordUser(user)
    setNewPassword('')
    setConfirmPassword('')
    setOpenPasswordDialog(true)
  }

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long!')
      return
    }
    try {
      await api.patch(`/users/${resetPasswordUser.id}/`, { password: newPassword })
      alert(`Password reset successfully for ${resetPasswordUser.username}!`)
      setOpenPasswordDialog(false)
      setResetPasswordUser(null)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      console.error('Error resetting password:', error)
      alert(error.response?.data?.password?.[0] || 'Error resetting password')
    }
  }

  const handleApproveExam = async (examId: number) => {
    try {
      await api.post(`/exams/${examId}/approve/`)
      fetchData()
      alert('Exam approved')
    } catch (error) {
      console.error('Error approving exam:', error)
    }
  }

  const handleRejectExam = async (examId: number) => {
    try {
      await api.post(`/exams/${examId}/reject/`)
      fetchData()
      alert('Exam rejected')
    } catch (error) {
      console.error('Error rejecting exam:', error)
    }
  }

  const handleCreateDepartment = async () => {
    try {
      await api.post('/departments/', deptForm)
      setOpenDeptDialog(false)
      fetchData()
      alert('Department created')
    } catch (error) {
      console.error('Error creating department:', error)
    }
  }

  const handleCreateCourse = async () => {
    try {
      await api.post('/courses/', courseForm)
      setOpenCourseDialog(false)
      fetchData()
      alert('Course created')
    } catch (error) {
      console.error('Error creating course:', error)
    }
  }

  const handleCreateSubject = async () => {
    try {
      await api.post('/subjects/', subjectForm)
      setOpenSubjectDialog(false)
      fetchData()
      alert('Subject created')
    } catch (error) {
      console.error('Error creating subject:', error)
    }
  }

  const handleCreateAnnouncement = async () => {
    try {
      await api.post('/announcements/', announcementForm)
      setOpenAnnouncementDialog(false)
      alert('Announcement sent')
    } catch (error) {
      console.error('Error creating announcement:', error)
    }
  }

  return (
    <Box sx={{ bgcolor: darkMode ? '#121212' : '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: darkMode ? '#1e1e1e' : '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Admin Dashboard</Typography>
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
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Users</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.total_users}</Typography>
                  </Box>
                  <People sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Exams</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.total_exams}</Typography>
                  </Box>
                  <School sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Pending Approvals</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.pending_exams}</Typography>
                  </Box>
                  <Assessment sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Students</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.active_students}</Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 60, opacity: 0.3 }} />
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
          <Tab label="Analytics" />
          <Tab label="Users" />
          <Tab label="Exams" />
          <Tab label="Departments" />
          <Tab label="Courses" />
          <Tab label="Subjects" />
          <Tab label="Announcements" />
          <Tab label="System Settings" />
        </Tabs>

        {/* Tab 0: Analytics & Charts */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Analytics & Insights</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                  <Typography variant="h6" gutterBottom>Users by Role</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                  <Pie
                    data={chartData.usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.usersByRole.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
              <Typography variant="h6" gutterBottom>Exams by Status</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.examsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
              <Typography variant="h6" gutterBottom>Monthly Activity Trends</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="exams" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="attempts" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
              <Typography variant="h6" gutterBottom>Users by Department</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.departmentStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="department" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
              <Typography variant="h6" gutterBottom>System Growth</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="exams" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="attempts" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
          </Box>
        )}

        {/* Tab 1: User Management */}
        {activeTab === 1 && (
          <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">User Management</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenUserDialog()}>
                Add User
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.first_name} {u.last_name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Chip label={u.role} size="small" /></TableCell>
                      <TableCell>
                        <Chip label={u.is_active ? 'Active' : 'Inactive'}
                          color={u.is_active ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => handleOpenUserDialog(u)}
                          title="Edit User">
                          <Edit />
                        </IconButton>
                        <Button size="small" variant="outlined" sx={{ mx: 1 }} 
                          onClick={() => handleOpenPasswordDialog(u)}>
                          Reset Password
                        </Button>
                        <IconButton size="small" onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                          title={u.is_active ? 'Deactivate' : 'Activate'}>
                          {u.is_active ? <Cancel /> : <CheckCircle />}
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteUser(u.id)}
                          title="Delete User">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Tab 2: Exam Approvals */}
        {activeTab === 2 && (
          <Box>
            {/* Pending Exams Section */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: darkMode ? '#3d2e1f' : '#fff3e0', border: '2px solid #ff9800', color: darkMode ? '#fff' : 'inherit' }}>
              <Typography variant="h5" gutterBottom sx={{ color: darkMode ? '#ffb74d' : '#e65100', fontWeight: 'bold' }}>
                ⚠️ Pending Exam Approvals ({exams.filter(e => e.status === 'pending').length})
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#e65100' }}>
                These exams require your approval before students can access them
              </Typography>
              {exams.filter(e => e.status === 'pending').length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                  ✅ No pending exams to review
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Title</strong></TableCell>
                        <TableCell><strong>Teacher</strong></TableCell>
                        <TableCell><strong>Subject</strong></TableCell>
                        <TableCell><strong>Duration</strong></TableCell>
                        <TableCell><strong>Total Marks</strong></TableCell>
                        <TableCell><strong>Questions</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exams.filter(e => e.status === 'pending').map((exam) => (
                        <TableRow key={exam.id} sx={{ bgcolor: 'white' }}>
                          <TableCell><strong>{exam.title}</strong></TableCell>
                          <TableCell>{exam.teacher_name}</TableCell>
                          <TableCell>{exam.subject_name}</TableCell>
                          <TableCell>{exam.duration_minutes} min</TableCell>
                          <TableCell>{exam.total_marks}</TableCell>
                          <TableCell>{exam.questions_count || 0}</TableCell>
                          <TableCell>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="success" 
                              onClick={() => handleApproveExam(exam.id)}
                              sx={{ mr: 1 }}
                              startIcon={<CheckCircle />}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="error" 
                              onClick={() => handleRejectExam(exam.id)}
                              startIcon={<Cancel />}
                            >
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            {/* All Exams Section */}
            <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
              <Typography variant="h5" gutterBottom>All Exams</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Teacher</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell>{exam.title}</TableCell>
                        <TableCell>{exam.teacher_name}</TableCell>
                        <TableCell>{exam.subject_name}</TableCell>
                        <TableCell>{exam.duration_minutes} min</TableCell>
                        <TableCell>
                          <Chip 
                            label={exam.status} 
                            size="small" 
                            color={
                              exam.status === 'approved' ? 'success' : 
                              exam.status === 'pending' ? 'warning' : 
                              'error'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {exam.status === 'pending' && (
                            <>
                              <Button 
                                size="small" 
                                color="success" 
                                onClick={() => handleApproveExam(exam.id)}
                                sx={{ mr: 1 }}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="small" 
                                color="error" 
                                onClick={() => handleRejectExam(exam.id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {exam.status === 'approved' && (
                            <Chip label="✓ Approved" color="success" size="small" />
                          )}
                          {exam.status === 'rejected' && (
                            <Chip label="✗ Rejected" color="error" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {/* Tab 3: Departments */}
        {activeTab === 3 && (
          <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Departments</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDeptDialog(true)}>
                Add Department
              </Button>
            </Box>
            <Grid container spacing={2}>
              {departments.map((dept) => (
                <Grid item xs={12} sm={6} md={4} key={dept.id}>
                  <Card sx={{ bgcolor: darkMode ? '#2a2a2a' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                    <CardContent>
                      <Typography variant="h6">{dept.name}</Typography>
                      <Typography color="textSecondary">Code: {dept.code}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Tab 4: Courses */}
        {activeTab === 4 && (
          <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Courses</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCourseDialog(true)}>
                Add Course
              </Button>
            </Box>
            <Grid container spacing={2}>
              {courses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card sx={{ bgcolor: darkMode ? '#2a2a2a' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                    <CardContent>
                      <Typography variant="h6">{course.name}</Typography>
                      <Typography color="textSecondary">Code: {course.code}</Typography>
                      <Typography variant="body2">Dept: {course.department_name}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Tab 5: Subjects */}
        {activeTab === 5 && (
          <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Subjects</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpenSubjectDialog(true)}>
                Add Subject
              </Button>
            </Box>
            <Grid container spacing={2}>
              {subjects.map((subject) => (
                <Grid item xs={12} sm={6} md={4} key={subject.id}>
                  <Card sx={{ bgcolor: darkMode ? '#2a2a2a' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                    <CardContent>
                      <Typography variant="h6">{subject.name}</Typography>
                      <Typography color="textSecondary">Code: {subject.code}</Typography>
                      <Typography variant="body2">Course: {subject.course_name}</Typography>
                      <Typography variant="body2">Teacher: {subject.teacher_name}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Tab 6: Announcements */}
        {activeTab === 6 && (
          <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
            <Typography variant="h5" gutterBottom>Send Announcement</Typography>
            <Button variant="contained" onClick={() => setOpenAnnouncementDialog(true)}>
              Create Announcement
            </Button>
          </Paper>
        )}

        {/* Tab 7: System Settings */}
        {activeTab === 7 && (
          <Paper sx={{ p: 3, bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
            <Typography variant="h5" gutterBottom>System Settings</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Customize the login page appearance
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, bgcolor: darkMode ? '#2a2a2a' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                  <Typography variant="h6" gutterBottom>Welcome Text</Typography>
                  <TextField
                    fullWidth
                    label="Welcome Message"
                    value={systemSettings.welcome_text}
                    onChange={(e) => setSystemSettings({ ...systemSettings, welcome_text: e.target.value })}
                    sx={{ mb: 2 }}
                    placeholder="Welcome to Online Exam Platform"
                  />
                  <Button variant="contained" onClick={handleUpdateSystemSettings}>
                    Update Welcome Text
                  </Button>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, bgcolor: darkMode ? '#2a2a2a' : 'white', color: darkMode ? '#fff' : 'inherit' }}>
                  <Typography variant="h6" gutterBottom>System Logo</Typography>
                  {systemSettings.logo && (
                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                      <img 
                        src={`http://localhost:8000${systemSettings.logo}`} 
                        alt="Current Logo" 
                        style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
                      />
                    </Box>
                  )}
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="logo-upload"
                    type="file"
                    onChange={handleLogoUpload}
                  />
                  <label htmlFor="logo-upload">
                    <Button variant="contained" component="span" fullWidth>
                      {systemSettings.logo ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                  </label>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Container>

      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Username" value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                disabled={!!editingUser}
                helperText={editingUser ? "Username cannot be changed" : ""} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" type="email" value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="First Name" value={userForm.first_name}
                onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Last Name" value={userForm.last_name}
                onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Password" type="password" value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                helperText={editingUser ? "Leave blank to keep current password" : "Required for new users"}
                required={!editingUser} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Department" value={userForm.department}
                onChange={(e) => setUserForm({ ...userForm, department: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Role" value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={<Switch checked={userForm.is_active}
                  onChange={(e) => setUserForm({ ...userForm, is_active: e.target.checked })} />}
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password for {resetPasswordUser?.username}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Enter a new password for this user. The password must be at least 8 characters long.
          </Typography>
          <TextField 
            fullWidth 
            label="New Password" 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 2 }}
            helperText="Minimum 8 characters"
          />
          <TextField 
            fullWidth 
            label="Confirm Password" 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mt: 2 }}
            error={confirmPassword !== '' && newPassword !== confirmPassword}
            helperText={confirmPassword !== '' && newPassword !== confirmPassword ? "Passwords do not match" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleResetPassword} 
            variant="contained" 
            color="primary"
            disabled={!newPassword || newPassword !== confirmPassword || newPassword.length < 8}
          >
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeptDialog} onClose={() => setOpenDeptDialog(false)}>
        <DialogTitle>Create Department</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={deptForm.name} sx={{ mt: 2 }}
            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} />
          <TextField fullWidth label="Code" value={deptForm.code} sx={{ mt: 2 }}
            onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeptDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateDepartment} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCourseDialog} onClose={() => setOpenCourseDialog(false)}>
        <DialogTitle>Create Course</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={courseForm.name} sx={{ mt: 2 }}
            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} />
          <TextField fullWidth label="Code" value={courseForm.code} sx={{ mt: 2 }}
            onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} />
          <TextField fullWidth select label="Department" value={courseForm.department} sx={{ mt: 2 }}
            onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}>
            {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCourseDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCourse} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSubjectDialog} onClose={() => setOpenSubjectDialog(false)}>
        <DialogTitle>Create Subject</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={subjectForm.name} sx={{ mt: 2 }}
            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} />
          <TextField fullWidth label="Code" value={subjectForm.code} sx={{ mt: 2 }}
            onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} />
          <TextField fullWidth select label="Course" value={subjectForm.course} sx={{ mt: 2 }}
            onChange={(e) => setSubjectForm({ ...subjectForm, course: e.target.value })}>
            {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField fullWidth select label="Teacher" value={subjectForm.teacher} sx={{ mt: 2 }}
            onChange={(e) => setSubjectForm({ ...subjectForm, teacher: e.target.value })}>
            {users.filter(u => u.role === 'teacher').map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.first_name} {t.last_name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubjectDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateSubject} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAnnouncementDialog} onClose={() => setOpenAnnouncementDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Announcement</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" value={announcementForm.title} sx={{ mt: 2 }}
            onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} />
          <TextField fullWidth multiline rows={4} label="Content" value={announcementForm.content} sx={{ mt: 2 }}
            onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} />
          <TextField fullWidth select label="Target Role" value={announcementForm.target_role} sx={{ mt: 2 }}
            onChange={(e) => setAnnouncementForm({ ...announcementForm, target_role: e.target.value })}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="student">Students</MenuItem>
            <MenuItem value="teacher">Teachers</MenuItem>
            <MenuItem value="admin">Admins</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAnnouncementDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAnnouncement} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminDashboard
