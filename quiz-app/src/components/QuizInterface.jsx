import React, { useState, useEffect } from 'react';
import QuestionDisplay from './QuestionDisplay';
import QuizNavigation from './QuizNavigation';
import QuizProgress from './QuizProgress';
import QuizPreview from './QuizPreview';
import { calculateScore } from '../utils/dataLoader';
import '../styles/QuizInterface.css';

/**
 * Quiz Interface Component
 * Main interface for taking the quiz with question display and navigation
 */
const QuizInterface = ({ 
  examData, 
  quizState, 
  onUpdateQuizState, 
  onQuizComplete, 
  onBackToSelector 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = examData?.questions?.[quizState.currentQuestionIndex];
  const totalQuestions = examData?.questions?.length || 0;

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    const newAnswers = {
      ...quizState.answers,
      [quizState.currentQuestionIndex]: answer
    };
    
    onUpdateQuizState({
      answers: newAnswers
    });
  };

  // Navigate to specific question
  const handleNavigateToQuestion = (questionIndex) => {
    if (questionIndex >= 0 && questionIndex < totalQuestions) {
      onUpdateQuizState({
        currentQuestionIndex: questionIndex
      });
      setShowPreview(false);
    }
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (quizState.currentQuestionIndex < totalQuestions - 1) {
      handleNavigateToQuestion(quizState.currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      handleNavigateToQuestion(quizState.currentQuestionIndex - 1);
    }
  };

  // Show preview of all answers
  const handleShowPreview = () => {
    setShowPreview(true);
  };

  // Hide preview and return to current question
  const handleHidePreview = () => {
    setShowPreview(false);
  };

  // Submit the quiz
  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;

    // Check if all questions are answered
    const unansweredQuestions = [];
    for (let i = 0; i < totalQuestions; i++) {
      if (!quizState.answers[i]) {
        unansweredQuestions.push(i + 1);
      }
    }

    if (unansweredQuestions.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredQuestions.length} unanswered questions. ` +
        `Are you sure you want to submit the exam?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);

    try {
      // Calculate final score
      const scoreResult = calculateScore(quizState.answers, examData.questions);
      
      // Complete the quiz
      onQuizComplete(quizState.answers, scoreResult);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('There was an error submitting your quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress statistics
  const getProgressStats = () => {
    const answered = Object.keys(quizState.answers).length;
    const unanswered = totalQuestions - answered;
    const progressPercentage = Math.round((answered / totalQuestions) * 100);

    return {
      answered,
      unanswered,
      total: totalQuestions,
      progressPercentage
    };
  };

  if (!examData || !currentQuestion) {
    return (
      <div className="quiz-interface loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }

  const progressStats = getProgressStats();

  return (
    <div className="quiz-interface">
      <div className="quiz-header">
        <div className="quiz-title">
          <h2>{examData.title}</h2>
          <p>{examData.description}</p>
        </div>
        
        <QuizProgress
          currentQuestion={quizState.currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          answered={progressStats.answered}
          progressPercentage={progressStats.progressPercentage}
        />
      </div>

      <div className="quiz-content">
        {showPreview ? (
          <QuizPreview
            examData={examData}
            answers={quizState.answers}
            onNavigateToQuestion={handleNavigateToQuestion}
            onHidePreview={handleHidePreview}
            onSubmitQuiz={handleSubmitQuiz}
            isSubmitting={isSubmitting}
          />
        ) : (
          <>
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={quizState.currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
              selectedAnswer={quizState.answers[quizState.currentQuestionIndex]}
              onAnswerSelect={handleAnswerSelect}
            />

            <QuizNavigation
              currentQuestionIndex={quizState.currentQuestionIndex}
              totalQuestions={totalQuestions}
              hasAnswer={!!quizState.answers[quizState.currentQuestionIndex]}
              onPreviousQuestion={handlePreviousQuestion}
              onNextQuestion={handleNextQuestion}
              onShowPreview={handleShowPreview}
              onSubmitQuiz={handleSubmitQuiz}
              onBackToSelector={onBackToSelector}
              answeredCount={progressStats.answered}
              isSubmitting={isSubmitting}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;
