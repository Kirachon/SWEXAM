import React from 'react';
import '../styles/QuizNavigation.css';

/**
 * Quiz Navigation Component
 * Provides navigation controls for the quiz
 */
const QuizNavigation = ({
  currentQuestionIndex,
  totalQuestions,
  hasAnswer,
  onPreviousQuestion,
  onNextQuestion,
  onShowPreview,
  onSubmitQuiz,
  onBackToSelector,
  answeredCount,
  isSubmitting
}) => {
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const allAnswered = answeredCount === totalQuestions;

  return (
    <div className="quiz-navigation">
      <div className="nav-section nav-left">
        <button
          className="btn btn-secondary"
          onClick={onBackToSelector}
          disabled={isSubmitting}
        >
          ← Back to Exam Sets
        </button>
      </div>

      <div className="nav-section nav-center">
        <div className="question-nav">
          <button
            className="btn btn-outline"
            onClick={onPreviousQuestion}
            disabled={isFirstQuestion || isSubmitting}
          >
            ← Previous
          </button>

          <div className="question-indicator">
            <span className="current-question">{currentQuestionIndex + 1}</span>
            <span className="question-separator">of</span>
            <span className="total-questions">{totalQuestions}</span>
          </div>

          <button
            className="btn btn-outline"
            onClick={onNextQuestion}
            disabled={isLastQuestion || isSubmitting}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="nav-section nav-right">
        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            onClick={onShowPreview}
            disabled={isSubmitting}
          >
            Preview Answers
          </button>

          <button
            className={`btn ${allAnswered ? 'btn-success' : 'btn-warning'}`}
            onClick={onSubmitQuiz}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner"></span>
                Submitting...
              </>
            ) : (
              <>
                Submit Exam
                {!allAnswered && (
                  <span className="incomplete-indicator">
                    ({totalQuestions - answeredCount} unanswered)
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="nav-status">
        <div className="answer-status">
          <span className={`status-indicator ${hasAnswer ? 'answered' : 'unanswered'}`}>
            {hasAnswer ? '✓' : '○'}
          </span>
          <span className="status-text">
            {hasAnswer ? 'Answered' : 'Not answered'}
          </span>
        </div>

        <div className="progress-summary">
          <span className="answered-count">{answeredCount}</span>
          <span className="progress-separator">/</span>
          <span className="total-count">{totalQuestions}</span>
          <span className="progress-label">completed</span>
        </div>
      </div>
    </div>
  );
};

export default QuizNavigation;
