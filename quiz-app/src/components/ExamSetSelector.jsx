import React, { useState } from 'react';
import '../styles/ExamSetSelector.css';

/**
 * Exam Set Selector Component
 * Allows users to choose from available exam sets
 */
const ExamSetSelector = ({ examSets, onSelectExamSet }) => {
  const [selectedSetId, setSelectedSetId] = useState(null);

  const handleSelectExamSet = (examSetId) => {
    setSelectedSetId(examSetId);
    onSelectExamSet(examSetId);
  };

  if (!examSets || examSets.length === 0) {
    return (
      <div className="exam-set-selector">
        <div className="exam-sets-empty">
          <h3>No Exam Sets Available</h3>
          <p>Please check back later or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-set-selector">
      <div className="selector-header">
        <h2>Choose Your Exam Set</h2>
        <p>Select from {examSets.length} comprehensive social work examination sets</p>
      </div>

      <div className="exam-sets-grid">
        {examSets.map((examSet) => (
          <div
            key={examSet.setId}
            className={`exam-set-card ${selectedSetId === examSet.setId ? 'selected' : ''}`}
          >
            <div className="exam-set-header">
              <div className="exam-set-title">{examSet.title}</div>
              <div className="exam-set-subtitle">Set {examSet.setId} of {examSets.length}</div>
            </div>

            <div className="exam-set-body">
              <div className="exam-set-description">
                {examSet.description}
              </div>

              <div className="exam-set-stats">
                <div className="stat-item">
                  <span className="stat-value">{examSet.questionCount}</span>
                  <span className="stat-label">Questions</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{examSet.timeLimit}</span>
                  <span className="stat-label">Minutes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{examSet.passingScore}%</span>
                  <span className="stat-label">Pass Rate</span>
                </div>
              </div>

              <div className="exam-set-topics">
                <div className="topics-label">Topics Covered:</div>
                <div className="topics-list">
                  {examSet.topics.slice(0, 4).map((topic, index) => (
                    <span key={index} className="topic-tag">
                      {topic}
                    </span>
                  ))}
                  {examSet.topics.length > 4 && (
                    <span className="topic-tag">
                      +{examSet.topics.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="exam-set-footer">
              <button
                className="select-exam-btn"
                onClick={() => handleSelectExamSet(examSet.setId)}
              >
                Start Exam Set {examSet.setId}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="selector-info">
        <h3>Exam Information</h3>
        <p>Each exam set contains 100 multiple-choice questions covering various aspects of social work group practice.</p>
        <ul>
          <li>All questions are based on professional social work literature and best practices</li>
          <li>You need 70% or higher to pass each exam</li>
          <li>Your progress is automatically saved as you work</li>
          <li>You can review your answers before final submission</li>
          <li>Detailed explanations are provided for each question</li>
        </ul>
      </div>
    </div>
  );
};

export default ExamSetSelector;
