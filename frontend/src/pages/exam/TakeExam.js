import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [violations, setViolations] = useState(0);

  useEffect(() => {
    fetchExamDetails();
    setupWebSocket();
    
    // Set up interval for time tracking
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Set up visibility change detection
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchExamDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`/api/exam/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExam(response.data);
      setQuestions(response.data.questions);
      setTimeLeft(response.data.duration * 60); // Convert to seconds
    } catch (error) {
      toast.error('Failed to load exam');
      navigate('/exams');
    }
  };

  const setupWebSocket = () => {
    const token = localStorage.getItem('access_token');
    socketRef.current = io('http://localhost:8000', {
      auth: { token },
      query: { exam_id: id }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to exam monitoring');
    });

    socketRef.current.on('violation', (data) => {
      setViolations(prev => prev + 1);
      toast.warning(`Violation detected: ${data.reason}`);
    });

    socketRef.current.on('exam_terminated', (data) => {
      toast.error('Exam terminated by administrator');
      handleForceSubmit();
    });
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      socketRef.current?.emit('tab_switch');
      setViolations(prev => prev + 1);
      toast.warning('Tab switching detected!');
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Send answer to server in real-time
    socketRef.current?.emit('answer_update', {
      question_id: questionId,
      answer: value
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`/api/exam/${id}/submit/`, {
        answers: answers,
        violations: violations
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Exam submitted successfully!');
      navigate('/results');
    } catch (error) {
      toast.error('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    toast.info('Time\'s up! Submitting exam...');
    handleSubmit();
  };

  const handleForceSubmit = () => {
    handleSubmit();
    navigate('/dashboard');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exam) {
    return <LinearProgress />;
  }

  const currentQ = questions[currentQuestion];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4">{exam.title}</Typography>
            <Typography color="textSecondary">
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" color="primary">
                Time Left: {formatTime(timeLeft)}
              </Typography>
              {violations > 0 && (
                <Alert severity="warning">
                  Violations: {violations}
                </Alert>
              )}
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowSubmitDialog(true)}
              >
                Submit Exam
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Progress Bar */}
      <LinearProgress 
        variant="determinate" 
        value={((currentQuestion + 1) / questions.length) * 100}
        sx={{ mb: 3 }}
      />

      {/* Question Navigation */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {questions.map((_, index) => (
            <Button
              key={index}
              variant={index === currentQuestion ? "contained" : "outlined"}
              onClick={() => setCurrentQuestion(index)}
              sx={{ minWidth: '40px' }}
            >
              {index + 1}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Current Question */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentQ?.question_text}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Marks: {currentQ?.marks} | Type: {currentQ?.question_type}
          </Typography>

          {/* Answer Options */}
          {currentQ?.question_type === 'MCQ' && (
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <RadioGroup
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              >
                {currentQ.options?.map((option, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {currentQ?.question_type === 'SHORT_ANSWER' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              placeholder="Type your answer here..."
              sx={{ mt: 2 }}
            />
          )}

          {currentQ?.question_type === 'ESSAY' && (
            <TextField
              fullWidth
              multiline
              rows={6}
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              placeholder="Write your essay here..."
              sx={{ mt: 2 }}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handlePrevQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              const answer = prompt('Mark for review? (Enter note)');
              if (answer !== null) {
                handleAnswerChange(currentQ.id, `REVIEW: ${answer}`);
              }
            }}
          >
            Mark for Review
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNextQuestion}
            disabled={currentQuestion === questions.length - 1}
          >
            Next Question
          </Button>
        </Box>
      </Box>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>Submit Exam</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit the exam?
            {questions.length - Object.keys(answers).length > 0 && (
              <Typography color="error" component="span">
                <br />
                You have {questions.length - Object.keys(answers).length} unanswered questions.
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TakeExam;

