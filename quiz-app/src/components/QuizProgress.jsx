import React from 'react';
import '../styles/QuizProgress.css';

/**
 * Quiz Progress Component
 * Shows progress through the quiz
 */
const QuizProgress = ({ 
  currentQuestion, 
  totalQuestions, 
  answered, 
  progressPercentage 
}) => {
  return (
    <div className="quiz-progress">
      <div className="progress-info">
        <div className="progress-text">
          <span className="progress-current">Question {currentQuestion}</span>
          <span className="progress-separator">of</span>
          <span className="progress-total">{totalQuestions}</span>
        </div>
        <div className="progress-stats">
          <span className="answered-count">{answered} answered</span>
          <span className="progress-percentage">({progressPercentage}%)</span>
        </div>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizProgress;
