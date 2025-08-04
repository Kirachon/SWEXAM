/**
 * Data Loading Utilities
 * Handles loading exam sets and question data from JSON files
 */

/**
 * Load the exam sets index
 */
export const loadExamSetsIndex = async () => {
  try {
    // Import the data directly for static deployment
    const examSetsIndex = await import('../data/exam-sets-index.json');
    return examSetsIndex.default;
  } catch (error) {
    console.error('Error loading exam sets index:', error);
    throw error;
  }
};

/**
 * Load a specific exam set
 */
export const loadExamSet = async (examSetId) => {
  try {
    // Import the data directly for static deployment
    const examSet = await import(`../data/exam-set-${examSetId}.json`);
    return examSet.default;
  } catch (error) {
    console.error(`Error loading exam set ${examSetId}:`, error);
    throw error;
  }
};

/**
 * Calculate quiz score
 */
export const calculateScore = (answers, questions) => {
  if (!answers || !questions || questions.length === 0) {
    return { score: 0, percentage: 0, correct: 0, total: questions?.length || 0 };
  }

  let correctCount = 0;
  const total = questions.length;

  questions.forEach((question, index) => {
    const userAnswer = answers[index];
    if (userAnswer === question.correctAnswer) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / total) * 100);

  return {
    score: correctCount,
    percentage,
    correct: correctCount,
    total,
    passed: percentage >= 70 // 70% passing threshold
  };
};

/**
 * Format time duration
 */
export const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 'N/A';
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Shuffle array (for randomizing questions if needed)
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get question statistics
 */
export const getQuestionStats = (answers, questions) => {
  const stats = {
    answered: 0,
    unanswered: 0,
    correct: 0,
    incorrect: 0
  };

  questions.forEach((question, index) => {
    const userAnswer = answers[index];
    
    if (userAnswer) {
      stats.answered++;
      if (userAnswer === question.correctAnswer) {
        stats.correct++;
      } else {
        stats.incorrect++;
      }
    } else {
      stats.unanswered++;
    }
  });

  return stats;
};
