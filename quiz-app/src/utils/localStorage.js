/**
 * Local Storage Utilities
 * Handles saving and loading user progress and preferences
 */

const STORAGE_KEYS = {
  PROGRESS: 'swexam_progress',
  PREFERENCES: 'swexam_preferences',
  HISTORY: 'swexam_history'
};

/**
 * Save quiz progress
 */
export const saveProgress = (progressData) => {
  try {
    const dataToSave = {
      ...progressData,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

/**
 * Load quiz progress
 */
export const loadProgress = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
};

/**
 * Clear quiz progress
 */
export const clearProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
  } catch (error) {
    console.error('Error clearing progress:', error);
  }
};

/**
 * Save user preferences
 */
export const savePreferences = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

/**
 * Load user preferences
 */
export const loadPreferences = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      fontSize: 'medium',
      showExplanations: true,
      autoAdvance: false
    };
  } catch (error) {
    console.error('Error loading preferences:', error);
    return {
      theme: 'light',
      fontSize: 'medium',
      showExplanations: true,
      autoAdvance: false
    };
  }
};

/**
 * Save exam result to history
 */
export const saveExamResult = (examResult) => {
  try {
    const history = loadExamHistory();
    const newResult = {
      ...examResult,
      completedAt: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    history.push(newResult);
    
    // Keep only last 50 results
    const trimmedHistory = history.slice(-50);
    
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving exam result:', error);
  }
};

/**
 * Load exam history
 */
export const loadExamHistory = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading exam history:', error);
    return [];
  }
};

/**
 * Clear exam history
 */
export const clearExamHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error('Error clearing exam history:', error);
  }
};

/**
 * Get storage usage info
 */
export const getStorageInfo = () => {
  try {
    const progress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    const preferences = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
    
    return {
      hasProgress: !!progress,
      hasPreferences: !!preferences,
      historyCount: history ? JSON.parse(history).length : 0,
      totalSize: (progress?.length || 0) + (preferences?.length || 0) + (history?.length || 0)
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      hasProgress: false,
      hasPreferences: false,
      historyCount: 0,
      totalSize: 0
    };
  }
};
