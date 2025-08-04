import React from 'react';
import '../styles/QuizPreview.css';

/**
 * Quiz Preview Component
 * Shows overview of all questions and answers before submission
 */
const QuizPreview = ({ 
  examData, 
  answers, 
  onNavigateToQuestion, 
  onHidePreview, 
  onSubmitQuiz, 
  isSubmitting 
}) => {
  const questions = examData?.questions || [];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const getQuestionStatus = (questionIndex) => {
    return answers[questionIndex] ? 'answered' : 'unanswered';
  };

  const handleQuestionClick = (questionIndex) => {
    onNavigateToQuestion(questionIndex);
  };

  return (
    <div className="quiz-preview">
      <div className="preview-header">
        <h3>Review Your Answers</h3>
        <p>Review your responses before submitting the exam</p>
        
        <div className="preview-stats">
          <div className="stat-item">
            <span className="stat-value answered">{answeredCount}</span>
            <span className="stat-label">Answered</span>
          </div>
          <div className="stat-item">
            <span className="stat-value unanswered">{unansweredCount}</span>
            <span className="stat-label">Unanswered</span>
          </div>
          <div className="stat-item">
            <span className="stat-value total">{questions.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      <div className="preview-content">
        <div className="questions-grid">
          {questions.map((question, index) => {
            const status = getQuestionStatus(index);
            const userAnswer = answers[index];
            
            return (
              <div
                key={index}
                className={`question-preview-item ${status}`}
                onClick={() => handleQuestionClick(index)}
              >
                <div className="question-number">
                  {index + 1}
                </div>
                <div className="question-info">
                  <div className="question-title">
                    Question {index + 1}
                  </div>
                  <div className="question-answer">
                    {userAnswer ? (
                      <span className="answer-selected">
                        Answer: {userAnswer}
                      </span>
                    ) : (
                      <span className="answer-missing">
                        Not answered
                      </span>
                    )}
                  </div>
                  <div className="question-topic">
                    {question.topic || 'General'}
                  </div>
                </div>
                <div className="question-status-icon">
                  {status === 'answered' ? '✓' : '○'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="preview-actions">
        <button
          className="btn btn-secondary"
          onClick={onHidePreview}
          disabled={isSubmitting}
        >
          Continue Reviewing
        </button>

        <div className="submit-section">
          {unansweredCount > 0 && (
            <div className="warning-message">
              <span className="warning-icon">⚠️</span>
              <span className="warning-text">
                You have {unansweredCount} unanswered questions
              </span>
            </div>
          )}
          
          <button
            className={`btn ${unansweredCount === 0 ? 'btn-success' : 'btn-warning'}`}
            onClick={onSubmitQuiz}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner"></span>
                Submitting Exam...
              </>
            ) : (
              <>
                Submit Exam
                {unansweredCount > 0 && (
                  <span className="incomplete-count">
                    ({unansweredCount} incomplete)
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;
