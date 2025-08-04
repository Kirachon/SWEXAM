import React, { useState, useEffect } from 'react';
import ExamSetSelector from './ExamSetSelector';
import QuizInterface from './QuizInterface';
import ResultsDisplay from './ResultsDisplay';
import { loadExamSetsIndex, loadExamSet } from '../utils/dataLoader';
import { saveProgress, loadProgress } from '../utils/localStorage';
import '../styles/QuizApp.css';

/**
 * Main Quiz Application Component
 * Manages the overall application state and navigation between different views
 */
const QuizApp = () => {
  const [currentView, setCurrentView] = useState('selector'); // 'selector', 'quiz', 'results'
  const [examSets, setExamSets] = useState([]);
  const [selectedExamSet, setSelectedExamSet] = useState(null);
  const [currentExamData, setCurrentExamData] = useState(null);
  const [quizState, setQuizState] = useState({
    currentQuestionIndex: 0,
    answers: {},
    startTime: null,
    endTime: null,
    score: null,
    isCompleted: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load exam sets index on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        const examSetsData = await loadExamSetsIndex();
        setExamSets(examSetsData.examSets);
        
        // Try to restore previous session
        const savedProgress = loadProgress();
        if (savedProgress && savedProgress.examSetId) {
          const examData = await loadExamSet(savedProgress.examSetId);
          setCurrentExamData(examData);
          setSelectedExamSet(savedProgress.examSetId);
          setQuizState(savedProgress.quizState);
          setCurrentView(savedProgress.currentView || 'quiz');
        }
      } catch (err) {
        setError('Failed to load exam data. Please refresh the page.');
        console.error('Error initializing app:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Save progress whenever quiz state changes
  useEffect(() => {
    if (selectedExamSet && currentView !== 'selector') {
      saveProgress({
        examSetId: selectedExamSet,
        currentView,
        quizState
      });
    }
  }, [selectedExamSet, currentView, quizState]);

  /**
   * Handle exam set selection
   */
  const handleExamSetSelect = async (examSetId) => {
    try {
      setLoading(true);
      const examData = await loadExamSet(examSetId);
      setCurrentExamData(examData);
      setSelectedExamSet(examSetId);
      setQuizState({
        currentQuestionIndex: 0,
        answers: {},
        startTime: new Date().toISOString(),
        endTime: null,
        score: null,
        isCompleted: false
      });
      setCurrentView('quiz');
    } catch (err) {
      setError('Failed to load exam set. Please try again.');
      console.error('Error loading exam set:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle quiz completion
   */
  const handleQuizComplete = (finalAnswers, score) => {
    const completedState = {
      ...quizState,
      answers: finalAnswers,
      endTime: new Date().toISOString(),
      score: score,
      isCompleted: true
    };
    setQuizState(completedState);
    setCurrentView('results');
  };

  /**
   * Handle restarting the current exam
   */
  const handleRestartExam = () => {
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      startTime: new Date().toISOString(),
      endTime: null,
      score: null,
      isCompleted: false
    });
    setCurrentView('quiz');
  };

  /**
   * Handle returning to exam set selector
   */
  const handleBackToSelector = () => {
    setSelectedExamSet(null);
    setCurrentExamData(null);
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      startTime: null,
      endTime: null,
      score: null,
      isCompleted: false
    });
    setCurrentView('selector');
    // Clear saved progress
    localStorage.removeItem('swexam_progress');
  };

  /**
   * Update quiz state
   */
  const updateQuizState = (updates) => {
    setQuizState(prevState => ({
      ...prevState,
      ...updates
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="quiz-app loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Social Work Examination...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="quiz-app error">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Main application render
  return (
    <div className="quiz-app">
      <header className="app-header">
        <h1>Social Work Examination</h1>
        <p>Interactive Quiz Application - Test Your Knowledge</p>
      </header>

      <main className="app-main">
        {currentView === 'selector' && (
          <div className="animate-fadeInUp">
            <ExamSetSelector
              examSets={examSets}
              onSelectExamSet={handleExamSetSelect}
            />
          </div>
        )}

        {currentView === 'quiz' && currentExamData && (
          <div className="animate-fadeInScale">
            <QuizInterface
              examData={currentExamData}
              quizState={quizState}
              onUpdateQuizState={updateQuizState}
              onQuizComplete={handleQuizComplete}
              onBackToSelector={handleBackToSelector}
            />
          </div>
        )}

        {currentView === 'results' && currentExamData && (
          <div className="animate-fadeInUp">
            <ResultsDisplay
              examData={currentExamData}
              quizState={quizState}
              onRestartExam={handleRestartExam}
              onBackToSelector={handleBackToSelector}
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 Social Work Examination System. Licensed under GPL v3.</p>
      </footer>
    </div>
  );
};

export default QuizApp;
