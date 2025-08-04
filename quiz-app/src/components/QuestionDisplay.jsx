import React from 'react';
import '../styles/QuestionDisplay.css';

/**
 * Question Display Component
 * Displays individual questions with multiple choice options
 */
const QuestionDisplay = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerSelect 
}) => {
  if (!question) {
    return (
      <div className="question-display">
        <div className="question-error">
          <p>Question not found</p>
        </div>
      </div>
    );
  }

  const handleOptionSelect = (optionKey) => {
    onAnswerSelect(optionKey);
  };

  return (
    <div className="question-display">
      <div className="question-header">
        <div className="question-number">
          Question {questionNumber} of {totalQuestions}
        </div>
        <div className="question-type">
          {question.type || 'Multiple Choice'}
        </div>
      </div>

      <div className="question-content">
        <div className="question-text">
          {question.question}
        </div>

        <div className="question-options">
          {Object.entries(question.options).map(([key, value]) => (
            <div
              key={key}
              className={`option ${selectedAnswer === key ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(key)}
            >
              <div className="option-marker">
                <span className="option-letter">{key}</span>
                <div className={`option-radio ${selectedAnswer === key ? 'checked' : ''}`}>
                  {selectedAnswer === key && <div className="radio-dot"></div>}
                </div>
              </div>
              <div className="option-text">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="question-footer">
        <div className="question-meta">
          <span className="question-topic">
            Topic: {question.topic || 'General'}
          </span>
          <span className="question-difficulty">
            Difficulty: {question.difficulty || 'Medium'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplay;
