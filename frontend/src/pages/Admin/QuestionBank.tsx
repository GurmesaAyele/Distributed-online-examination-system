// src/pages/admin/QuestionBank.tsx
import React, { useState, useEffect } from 'react';
import './QuestionBank.css';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  subject: string;
  difficulty: string;
  marks: number;
  created_by: string;
}

const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockQuestions: Question[] = [
      {
        id: 1,
        question_text: 'What is the value of π?',
        question_type: 'mcq',
        subject: 'Mathematics',
        difficulty: 'easy',
        marks: 5,
        created_by: 'Admin User'
      },
      {
        id: 2,
        question_text: 'Explain Newton\'s First Law of Motion',
        question_type: 'essay',
        subject: 'Physics',
        difficulty: 'medium',
        marks: 10,
        created_by: 'Admin User'
      },
    ];
    
    setQuestions(mockQuestions);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="question-bank">
      <div className="page-header">
        <h1>Question Bank</h1>
        <button className="btn-primary">
          + Add Question
        </button>
      </div>

      <div className="questions-table">
        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>Type</th>
              <th>Subject</th>
              <th>Difficulty</th>
              <th>Marks</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id}>
                <td className="question-text">{question.question_text}</td>
                <td>
                  <span className={`type-badge ${question.question_type}`}>
                    {question.question_type}
                  </span>
                </td>
                <td>{question.subject}</td>
                <td>
                  <span className={`difficulty-badge ${question.difficulty}`}>
                    {question.difficulty}
                  </span>
                </td>
                <td>{question.marks}</td>
                <td>{question.created_by}</td>
                <td>
                  <button className="btn-secondary">Edit</button>
                  <button className="btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionBank;