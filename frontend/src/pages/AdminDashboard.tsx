import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as ExamIcon,
  BarChart as ChartIcon,
  Notifications as NotificationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    ongoingExams: 0,
    totalSubmissions: 0
  });
  
  const [users, setUsers] = useState([
    {
      id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      userType: 'STUDENT',
      joinedDate: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      username: 'jane_smith',
      email: 'jane@example.com',
      userType: 'TEACHER',
      joinedDate: '2024-01-10',
      status: 'active'
    }
  ]);
  
  const [exams, setExams] = useState([
    {
      id: '1',
      title: 'Python Programming Test',
      description: 'Basic Python concepts and programming',
      duration: 60,
      totalMarks: 100,
      startTime: '2024-01-20T10:00:00',
      endTime: '2024-01-20T12:00:00',
      status: 'upcoming',
      participantCount: 45
    },
    {
      id: '2',
      title: 'Database Management System',
      description: 'SQL queries and database concepts',
      duration: 90,
      totalMarks: 100,
      startTime: '2024-01-18T09:00:00',
      endTime: '2024-01-18T11:30:00',
      status: 'ongoing',
      participantCount: 32
    }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalUsers: 125,
        totalExams: 8,
        ongoingExams: 2,
        totalSubmissions: 325
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCreateExam = () => {
    setSelectedExam(null);
    setOpenDialog(true);
  };

  const handleEditExam = (exam: any) => {
    setSelectedExam(exam);
    setOpenDialog(true);
  };

  const handleDeleteExam = (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      setExams(prev => prev.filter(exam => exam.id !== examId));
      showNotification('Exam deleted successfully', 'success');
    }
  };

  const handleSaveExam = (examData: any) => {
    if (selectedExam) {
      setExams(prev => prev.map(exam => 
        exam.id === selectedExam.id ? { ...exam, ...examData } : exam
      ));
      showNotification('Exam updated successfully', 'success');
    } else {
      const newExam = {
        id: Date.now().toString(),
        title: examData.title || 'New Exam',
        description: examData.description || '',
        duration: examData.duration || 60,
        totalMarks: examData.totalMarks || 100,
        startTime: examData.startTime || new Date().toISOString(),
        endTime: examData.endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        participantCount: 0
      };
      setExams(prev => [...prev, newExam]);
      showNotification('Exam created successfully', 'success');
    }
    setOpenDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ongoing':
        return 'success';
      case 'upcoming':
        return 'warning';
      case 'completed':
        return 'primary';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage exams, users, and monitor system activity
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Total Users</Typography>
              </Box>
              <Typography variant="h4">{stats.totalUsers}</Typography>
              <Typography variant="body2" color="text.secondary">
                Registered users
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ExamIcon color="secondary" sx={{ mr: 2 }} />
                <Typography variant="h6">Total Exams</Typography>
              </Box>
              <Typography variant="h4">{stats.totalExams}</Typography>
              <Typography variant="body2" color="text.secondary">
                Created exams
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationIcon color="warning" sx={{ mr: 2 }} />
                <Typography variant="h6">Ongoing Exams</Typography>
              </Box>
              <Typography variant="h4">{stats.ongoingExams}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active right now
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ChartIcon color="success" sx={{ mr: 2 }} />
                <Typography variant="h6">Submissions</Typography>
              </Box>
              <Typography variant="h4">{stats.totalSubmissions}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total exam submissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateExam}
        >
          Create New Exam
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
        >
          Refresh Data
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Exams Management</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Participants</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1">{exam.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exam.description.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{exam.duration} min</TableCell>
                  <TableCell>
                    <Chip
                      label={exam.status.toUpperCase()}
                      color={getStatusColor(exam.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{exam.participantCount}</TableCell>
                  <TableCell>
                    {new Date(exam.startTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditExam(exam)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteExam(exam.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>User Type</TableCell>
                <TableCell>Joined Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.userType}</TableCell>
                  <TableCell>
                    {new Date(user.joinedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status.toUpperCase()}
                      color={getStatusColor(user.status) as any}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedExam ? 'Edit Exam' : 'Create New Exam'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Exam Title"
              defaultValue={selectedExam?.title}
              fullWidth
              required
            />
            <TextField
              label="Description"
              defaultValue={selectedExam?.description}
              multiline
              rows={3}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Duration (minutes)"
                type="number"
                defaultValue={selectedExam?.duration || 60}
                fullWidth
              />
              <TextField
                label="Total Marks"
                type="number"
                defaultValue={selectedExam?.totalMarks || 100}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Time"
                type="datetime-local"
                defaultValue={selectedExam?.startTime?.substring(0, 16) || 
                  new Date().toISOString().substring(0, 16)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Time"
                type="datetime-local"
                defaultValue={selectedExam?.endTime?.substring(0, 16) || 
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleSaveExam({})}
          >
            {selectedExam ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard;
