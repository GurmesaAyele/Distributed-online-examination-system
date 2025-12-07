import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Container, Typography, Button, Paper, Radio, RadioGroup, FormControlLabel, TextField, Alert, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Rating } from '@mui/material'
import api from '../api/axios'

const ExamInterface = () => {
  const { examId } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState<any>(null)
  const [attempt, setAttempt] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [violations, setViolations] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({
    comment: '',
    rating: 5
  })
  const questionsPerPage = 3
  
  // Use ref to track violations to avoid stale closure
  const violationsRef = useRef(0)
  const attemptRef = useRef<any>(null)

  useEffect(() => {
    startExam()
    setupSecurityListeners()
    return () => removeSecurityListeners()
  }, [])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && attempt) {
      // Auto-submit when time expires
      alert('⏰ Time is up! Your exam will be submitted automatically.')
      handleAutoSubmit()
    }
  }, [timeLeft])

  const handleAutoSubmit = async () => {
    if (attempt) {
      try {
        await api.post(`/attempts/${attempt.id}/submit_exam/`)
        // Show feedback dialog even for auto-submit
        setOpenFeedbackDialog(true)
      } catch (error) {
        console.error('Error submitting exam:', error)
      }
    }
  }

  const startExam = async () => {
    try {
      console.log('Starting exam with ID:', examId)
      const response = await api.post('/attempts/start_exam/', { exam_id: examId })
      console.log('Attempt created:', response.data)
      setAttempt(response.data)
      attemptRef.current = response.data
      
      const examRes = await api.get(`/exams/${examId}/`)
      console.log('Exam data received:', examRes.data)
      console.log('Questions in exam:', examRes.data.questions)
      console.log('Questions count:', examRes.data.questions?.length || 0)
      
      if (!examRes.data.questions || examRes.data.questions.length === 0) {
        alert('⚠️ This exam has no questions yet!\n\nPlease contact your teacher to add questions to this exam.')
        navigate('/student')
        return
      }
      
      setExam(examRes.data)
      setTimeLeft(examRes.data.duration_minutes * 60)
    } catch (error: any) {
      console.error('Error starting exam:', error)
      alert('Error starting exam: ' + (error.response?.data?.error || error.message || 'Unknown error'))
      navigate('/student')
    }
  }

  const setupSecurityListeners = () => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('copy', handleCopyPaste)
    document.addEventListener('paste', handleCopyPaste)
    document.addEventListener('cut', handleCopyPaste)
    document.addEventListener('contextmenu', (e) => e.preventDefault())
    document.addEventListener('selectstart', (e) => {
      // Allow selection only in text input fields
      const target = e.target as HTMLElement
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault()
      }
    })
    document.addEventListener('dragstart', (e) => e.preventDefault())
    document.addEventListener('keydown', handleKeyDown)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P, F12, Ctrl+Shift+I
    if (
      (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a' || e.key === 'p')) ||
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.ctrlKey && e.shiftKey && e.key === 'J') ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault()
      if (attemptRef.current && (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x'))) {
        logViolation('copy_paste', 'Keyboard shortcut attempted: ' + e.key)
      }
    }
  }

  const removeSecurityListeners = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    document.removeEventListener('copy', handleCopyPaste)
    document.removeEventListener('paste', handleCopyPaste)
    document.removeEventListener('cut', handleCopyPaste)
    document.removeEventListener('keydown', handleKeyDown)
  }

  const handleVisibilityChange = () => {
    if (document.hidden && attemptRef.current) {
      console.log('🚨 Tab switch detected! Current violations:', violationsRef.current)
      logViolation('tab_switch', 'User switched tabs or minimized window')
    }
  }

  const handleCopyPaste = (e: Event) => {
    e.preventDefault()
    if (attemptRef.current) {
      logViolation('copy_paste', 'Copy/paste attempted')
    }
  }

  const logViolation = async (type: string, details: string) => {
    if (!attemptRef.current) return
    
    try {
      console.log(`📝 Logging violation: ${type} - ${details}`)
      const response = await api.post(`/attempts/${attemptRef.current.id}/log_violation/`, {
        violation_type: type, details
      })
      
      violationsRef.current += 1
      const newViolations = violationsRef.current
      setViolations(newViolations)
      
      console.log(`⚠️ Total violations now: ${newViolations}`)
      
      if (newViolations === 1) {
        setWarningMessage('⚠️ WARNING #1: Tab switching and copy/paste are not allowed! You have 2 more chances.')
        setShowWarning(true)
        playAlertSound()
        console.log('🔔 First warning shown')
      } else if (newViolations === 2) {
        setWarningMessage('⚠️ WARNING #2: This is your LAST chance! One more violation will auto-submit your exam.')
        setShowWarning(true)
        playAlertSound()
        console.log('🔔 Second warning shown')
      } else if (newViolations >= 3 || response.data.auto_submit) {
        setWarningMessage('🚫 EXAM AUTO-SUBMITTED: You exceeded the maximum violations (3). Your exam has been saved and submitted.')
        setShowWarning(true)
        console.log('🚫 Exam auto-submitted due to violations')
        setTimeout(() => {
          navigate('/student')
        }, 3000)
      }
    } catch (error) {
      console.error('❌ Error logging violation:', error)
    }
  }

  const playAlertSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0vBSh+zPDajzsKElyx6OyrWBUIQ5zd8sFuJAUuhM/z24k2Bxdju+zpoVIRC0yl4fG5ZRwFNo3V785+LwUofszw2o87ChJcsei0q1kVCEOc3fK/bSQFLoTP89uJNgcXY7vs6aFSEQtMpeHxuWUcBTaN1e/Ofi8FKH7M8NqPOwsSXLHotKtZFQhDnN3yv20kBS6Ez/PbiTYHF2O77OmhUhELTKXh8bllHAU2jdXvzn4vBSh+zPDajzsKElyx6LSrWRUIQ5zd8r9tJAUuhM/z24k2Bxdju+zpoVIRC0yl4fG5ZRwFNo3V785+LwUofszw2o87ChJcsei0q1kVCEOc3fK/bSQFLoTP89uJNgcXY7vs6aFSEQtMpeHxuWUcBTaN1e/Ofi8FKH7M8NqPOwsSXLHotKtZFQhDnN3yv20kBS6Ez/PbiTYHF2O77OmhUhELTKXh8bllHAU2jdXvzn4vBSh+zPDajzsKElyx6LSrWRUIQ5zd8r9tJAUuhM/z24k2Bxdju+zpoVIRC0yl4fG5ZRwFNo3V785+LwUofszw2o87ChJcsei0q1kVCEOc3fK/bSQFLoTP89uJNgcXY7vs6aFSEQtMpeHxuWUcBTaN1e/Ofi8FKH7M8NqPOwsSXLHotKtZFQhDnN3yv20kBS6Ez/PbiTYHF2O77OmhUhELTKXh8bllHAU2jdXvzn4vBSh+zPDajzsKElyx6LSrWRUIQ5zd8r9tJAUuhM/z24k2Bxdju+zpoVIRC0yl4fG5ZRwFNo3V785+LwUofszw2o87ChJcsei0q1kVCEOc3fK/bSQFLoTP89uJNgcXY7vs6aFSEQtMpeHxuWUcBTaN1e/Ofi8FKH7M8NqPOwsSXLHotKtZFQhDnN3yv20kBS6Ez/PbiTYHF2O77OmhUhELTKXh8bllHAU2jdXvzn4vBSh+zPDajzsKElyx6LSrWRUIQ5zd8r9tJAUuhM/z24k2Bxdju+zpoVIRC0yl4fG5ZRwFNo3V785+LwUofszw2o87ChJcsei0q1kVCEOc3fK/bSQFLoTP89uJNgcXY7vs6aFSEQtMpeHxuWUcBTaN1e/Ofi8FKH7M8NqPOwsSXLHotKtZFQhDnN3yv20kBS6Ez/PbiTYHF2O77OmhUhELTKXh8bllHAU2jdXvzn4vBSh+zPDajzsKElyx6LSrWRUIQ5zd8r9tJAUuhM/z24k2Bxdju+zpoVIRC0yl4fG5ZRwFNo3V785+LwUofszw2o87ChJcsei0q1kVCEOc3fK/bSQFLoTP89uJNgcXY7vs6aFSEQtMpeHxuWUcBTaN1e/Ofi8FKH7M8NqPOwsSXLHotKtZFQhDnN3yv20kBS6Ez/PbiTYHF2O77OmhUhELTKXh8bllHAU2jdXvzn4vBSh+zPDajzsKElyx6LSrWRUIQ5zd8r9tJAUuhM/z24k2Bxdju+zpoVIRC0yl4fG5ZRwFNo3V785+LwUofszw2o87ChJcsei0q1kVCEOc3fK/bSQFLoTP89uJNgcXY7vs6aFSEQtMpeHxuWUcBTaN1e/Ofi8FKH7M8NqPOwsSXLHotKtZFQ==')
    audio.play().catch(() => {})
  }

  const handleAnswerChange = async (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value })
    if (attempt) {
      try {
        await api.post(`/attempts/${attempt.id}/save_answer/`, {
          question_id: questionId, answer_text: value
        })
      } catch (error) {
        console.error('Error saving answer:', error)
      }
    }
  }

  const handleSubmit = async () => {
    if (attempt && window.confirm('Are you sure you want to submit the exam?')) {
      try {
        await api.post(`/attempts/${attempt.id}/submit_exam/`)
        // Show feedback dialog immediately after submission
        setOpenFeedbackDialog(true)
      } catch (error) {
        console.error('Error submitting exam:', error)
        alert('Error submitting exam. Please try again.')
      }
    }
  }

  const handleSubmitFeedback = async () => {
    try {
      await api.post('/feedbacks/', {
        exam: exam.id,
        attempt: attempt.id,
        comment: feedbackForm.comment,
        rating: feedbackForm.rating
      })
      setOpenFeedbackDialog(false)
      alert('✅ Exam submitted successfully! Thank you for your feedback.')
      navigate('/student')
    } catch (error: any) {
      console.error('Error submitting feedback:', error)
      if (error.response?.data?.non_field_errors) {
        alert('You have already submitted feedback for this exam.')
        setOpenFeedbackDialog(false)
        navigate('/student')
      } else {
        alert('Failed to submit feedback. But your exam was submitted successfully.')
        navigate('/student')
      }
    }
  }

  const handleSkipFeedback = () => {
    setOpenFeedbackDialog(false)
    alert('✅ Exam submitted successfully!')
    navigate('/student')
  }

  if (!exam || !attempt) return <Box sx={{ p: 4 }}><Typography>Loading exam...</Typography></Box>

  const currentQuestions = exam.questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage)
  const totalPages = Math.ceil(exam.questions.length / questionsPerPage)
  const progress = (Object.keys(answers).length / exam.questions.length) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f5f5',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none'
    }}>
      <Paper sx={{ p: 2, mb: 2, position: 'sticky', top: 0, zIndex: 1000 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ userSelect: 'none' }}>{exam.title}</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="h6" color={timeLeft < 300 ? 'error' : 'primary'} sx={{ userSelect: 'none' }}>
              Time Left: {formatTime(timeLeft)}
            </Typography>
            <Typography sx={{ userSelect: 'none' }}>Violations: {violations}/3</Typography>
          </Box>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
        <Typography variant="body2" sx={{ mt: 0.5, userSelect: 'none' }}>
          Progress: {Object.keys(answers).length}/{exam.questions.length} questions answered
        </Typography>
      </Paper>

      <Container maxWidth="md">
        {currentQuestions.map((question: any, idx: number) => (
          <Paper key={question.id} sx={{ 
            p: 3, 
            mb: 3,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}>
            <Typography variant="h6" gutterBottom sx={{ userSelect: 'none' }}>
              Question {currentPage * questionsPerPage + idx + 1}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, userSelect: 'none' }}>
              {question.question_text}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ userSelect: 'none' }}>
              Marks: {question.marks}
            </Typography>

            {question.question_type === 'mcq' && (
              <RadioGroup value={answers[question.id] || ''} onChange={(e) => handleAnswerChange(question.id, e.target.value)}>
                <FormControlLabel 
                  value="A" 
                  control={<Radio />} 
                  label={`A. ${question.option_a}`}
                  sx={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                />
                <FormControlLabel 
                  value="B" 
                  control={<Radio />} 
                  label={`B. ${question.option_b}`}
                  sx={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                />
                <FormControlLabel 
                  value="C" 
                  control={<Radio />} 
                  label={`C. ${question.option_c}`}
                  sx={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                />
                <FormControlLabel 
                  value="D" 
                  control={<Radio />} 
                  label={`D. ${question.option_d}`}
                  sx={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                />
              </RadioGroup>
            )}

            {question.question_type === 'true_false' && (
              <RadioGroup value={answers[question.id] || ''} onChange={(e) => handleAnswerChange(question.id, e.target.value)}>
                <FormControlLabel 
                  value="True" 
                  control={<Radio />} 
                  label="True"
                  sx={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                />
                <FormControlLabel 
                  value="False" 
                  control={<Radio />} 
                  label="False"
                  sx={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                />
              </RadioGroup>
            )}

            {question.question_type === 'subjective' && (
              <TextField fullWidth multiline rows={4} value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder="Type your answer here..." />
            )}
          </Paper>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Button variant="outlined" disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </Button>
          <Typography>Page {currentPage + 1} of {totalPages}</Typography>
          {currentPage < totalPages - 1 ? (
            <Button variant="outlined" onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleSubmit}>Submit Exam</Button>
          )}
        </Box>
      </Container>

      <Dialog open={showWarning} onClose={() => setShowWarning(false)}>
        <DialogTitle>⚠️ Violation Warning</DialogTitle>
        <DialogContent>
          <Alert severity="error">{warningMessage}</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarning(false)} variant="contained">I Understand</Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog - Shown immediately after exam submission */}
      <Dialog open={openFeedbackDialog} onClose={handleSkipFeedback} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ✅ Exam Submitted Successfully!
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Please share your feedback about this exam
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              📝 Your Comments (Optional)
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
              Share your thoughts about the exam, any confusing questions, or suggestions for improvement
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Example: Question 5 was confusing, the wording could be clearer..."
              value={feedbackForm.comment}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              ⭐ Rate this Exam (Optional)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating
                value={feedbackForm.rating}
                onChange={(_, newValue) => setFeedbackForm({ ...feedbackForm, rating: newValue || 5 })}
                size="large"
              />
              <Typography variant="body2" color="textSecondary">
                ({feedbackForm.rating}/5)
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              💡 Your feedback helps teachers improve the exam quality. It will be sent to your teacher.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleSkipFeedback} variant="outlined">
            Skip Feedback
          </Button>
          <Button onClick={handleSubmitFeedback} variant="contained" color="primary">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ExamInterface
