import React, { useState, useEffect } from 'react';
import { formatDuration, getQuestionStats } from '../utils/dataLoader';
import { saveExamResult } from '../utils/localStorage';
import '../styles/ResultsDisplay.css';

/**
 * Results Display Component
 * Shows exam results with detailed breakdown and explanations
 */
const ResultsDisplay = ({ 
  examData, 
  quizState, 
  onRestartExam, 
  onBackToSelector 
}) => {
  const [showExplanations, setShowExplanations] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const questions = examData?.questions || [];
  const answers = quizState.answers || {};
  const score = quizState.score || { score: 0, percentage: 0, correct: 0, total: 0, passed: false };
  
  const duration = formatDuration(quizState.startTime, quizState.endTime);
  const stats = getQuestionStats(answers, questions);

  // Save result to history on component mount
  useEffect(() => {
    const examResult = {
      examSetId: examData.setId,
      examTitle: examData.title,
      score: score.score,
      percentage: score.percentage,
      totalQuestions: score.total,
      duration: duration,
      passed: score.passed,
      startTime: quizState.startTime,
      endTime: quizState.endTime
    };
    
    saveExamResult(examResult);
  }, [examData, score, duration, quizState]);

  const handleShowExplanations = () => {
    setShowExplanations(true);
  };

  const handleHideExplanations = () => {
    setShowExplanations(false);
    setSelectedQuestion(null);
  };

  const handleQuestionSelect = (questionIndex) => {
    setSelectedQuestion(questionIndex);
  };

  const getQuestionResult = (questionIndex) => {
    const question = questions[questionIndex];
    const userAnswer = answers[questionIndex];
    const isCorrect = userAnswer === question.correctAnswer;
    
    return {
      question,
      userAnswer,
      isCorrect,
      wasAnswered: !!userAnswer
    };
  };

  return (
    <div className="results-display">
      {!showExplanations ? (
        <>
          <div className="results-header">
            <div className={`score-display ${score.passed ? 'passed' : 'failed'}`}>
              <div className="score-circle">
                <div className="score-percentage">{score.percentage}%</div>
                <div className="score-fraction">{score.correct}/{score.total}</div>
              </div>
              <div className="score-status">
                <h2>{score.passed ? 'Congratulations!' : 'Keep Studying!'}</h2>
                <p>
                  {score.passed 
                    ? 'You have successfully passed this exam.'
                    : 'You need 70% or higher to pass. Try again!'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="results-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-label">Score</div>
                <div className="summary-value">{score.correct} / {score.total}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Percentage</div>
                <div className="summary-value">{score.percentage}%</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Time Taken</div>
                <div className="summary-value">{duration}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Status</div>
                <div className={`summary-value ${score.passed ? 'passed' : 'failed'}`}>
                  {score.passed ? 'PASSED' : 'FAILED'}
                </div>
              </div>
            </div>
          </div>

          <div className="results-breakdown">
            <h3>Detailed Breakdown</h3>
            <div className="breakdown-stats">
              <div className="stat-bar">
                <div className="stat-label">Correct Answers</div>
                <div className="stat-visual">
                  <div className="stat-bar-bg">
                    <div 
                      className="stat-bar-fill correct"
                      style={{ width: `${(stats.correct / stats.answered) * 100}%` }}
                    ></div>
                  </div>
                  <div className="stat-value">{stats.correct}</div>
                </div>
              </div>
              
              <div className="stat-bar">
                <div className="stat-label">Incorrect Answers</div>
                <div className="stat-visual">
                  <div className="stat-bar-bg">
                    <div 
                      className="stat-bar-fill incorrect"
                      style={{ width: `${(stats.incorrect / stats.answered) * 100}%` }}
                    ></div>
                  </div>
                  <div className="stat-value">{stats.incorrect}</div>
                </div>
              </div>
              
              <div className="stat-bar">
                <div className="stat-label">Unanswered</div>
                <div className="stat-visual">
                  <div className="stat-bar-bg">
                    <div 
                      className="stat-bar-fill unanswered"
                      style={{ width: `${(stats.unanswered / questions.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="stat-value">{stats.unanswered}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="results-actions">
            <button
              className="btn btn-primary"
              onClick={handleShowExplanations}
            >
              Review Answers & Explanations
            </button>
            
            <div className="action-group">
              <button
                className="btn btn-outline"
                onClick={onRestartExam}
              >
                Retake This Exam
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={onBackToSelector}
              >
                Choose Different Exam
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="explanations-view">
          <div className="explanations-header">
            <h3>Answer Explanations</h3>
            <button
              className="btn btn-secondary"
              onClick={handleHideExplanations}
            >
              Back to Results
            </button>
          </div>

          <div className="explanations-content">
            <div className="questions-list">
              {questions.map((question, index) => {
                const result = getQuestionResult(index);
                
                return (
                  <div
                    key={index}
                    className={`explanation-item ${result.isCorrect ? 'correct' : 'incorrect'} ${!result.wasAnswered ? 'unanswered' : ''} ${selectedQuestion === index ? 'selected' : ''}`}
                    onClick={() => handleQuestionSelect(index)}
                  >
                    <div className="explanation-header">
                      <div className="question-number">Q{index + 1}</div>
                      <div className="result-icon">
                        {!result.wasAnswered ? '○' : result.isCorrect ? '✓' : '✗'}
                      </div>
                    </div>
                    
                    {selectedQuestion === index && (
                      <div className="explanation-details">
                        <div className="question-text">
                          {question.question}
                        </div>
                        
                        <div className="answer-comparison">
                          <div className="user-answer">
                            <strong>Your Answer:</strong> {result.userAnswer || 'Not answered'}
                          </div>
                          <div className="correct-answer">
                            <strong>Correct Answer:</strong> {question.correctAnswer}
                          </div>
                        </div>
                        
                        <div className="explanation-text">
                          <strong>Explanation:</strong>
                          <p>{question.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
