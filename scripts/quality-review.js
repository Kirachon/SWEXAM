const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Quality Review System
 * Analyzes all questions for duplicates, quality issues, and accuracy
 */

class QualityReviewer {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'quiz-app', 'src', 'data');
        this.outputDir = path.join(__dirname, '..', 'quality-review');
        this.allQuestions = [];
        this.duplicates = [];
        this.qualityIssues = [];
        this.highQualityQuestions = [];
    }

    /**
     * Initialize quality review process
     */
    async init() {
        console.log('🔍 Starting comprehensive quality review...');
        
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        await this.loadAllQuestions();
        await this.detectDuplicates();
        await this.assessQuestionQuality();
        await this.verifyAnswers();
        await this.generateQualityReport();
        
        console.log('✅ Quality review completed!');
    }

    /**
     * Load all questions from exam sets
     */
    async loadAllQuestions() {
        console.log('📚 Loading all questions...');
        
        for (let i = 1; i <= 10; i++) {
            const examPath = path.join(this.dataDir, `exam-set-${i}.json`);
            if (fs.existsSync(examPath)) {
                const examData = JSON.parse(fs.readFileSync(examPath, 'utf8'));
                examData.questions.forEach((question, index) => {
                    this.allQuestions.push({
                        ...question,
                        originalExamSet: i,
                        originalIndex: index,
                        globalIndex: this.allQuestions.length
                    });
                });
            }
        }
        
        console.log(`   ✓ Loaded ${this.allQuestions.length} total questions`);
    }

    /**
     * Detect duplicate and near-duplicate questions
     */
    async detectDuplicates() {
        console.log('🔍 Detecting duplicates...');
        
        const questionMap = new Map();
        const nearDuplicates = [];
        
        for (let i = 0; i < this.allQuestions.length; i++) {
            const question = this.allQuestions[i];
            const normalizedText = this.normalizeQuestionText(question.question);
            
            // Check for exact duplicates
            if (questionMap.has(normalizedText)) {
                this.duplicates.push({
                    type: 'exact',
                    original: questionMap.get(normalizedText),
                    duplicate: question,
                    similarity: 1.0
                });
            } else {
                questionMap.set(normalizedText, question);
            }
            
            // Check for near duplicates
            for (let j = i + 1; j < this.allQuestions.length; j++) {
                const otherQuestion = this.allQuestions[j];
                const similarity = this.calculateSimilarity(question.question, otherQuestion.question);
                
                if (similarity > 0.8 && similarity < 1.0) {
                    nearDuplicates.push({
                        type: 'near',
                        question1: question,
                        question2: otherQuestion,
                        similarity: similarity
                    });
                }
            }
        }
        
        this.duplicates.push(...nearDuplicates);
        console.log(`   ✓ Found ${this.duplicates.length} duplicate/near-duplicate questions`);
    }

    /**
     * Normalize question text for comparison
     */
    normalizeQuestionText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Calculate similarity between two questions
     */
    calculateSimilarity(text1, text2) {
        const words1 = new Set(this.normalizeQuestionText(text1).split(' '));
        const words2 = new Set(this.normalizeQuestionText(text2).split(' '));
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    /**
     * Assess question quality
     */
    async assessQuestionQuality() {
        console.log('📝 Assessing question quality...');
        
        for (const question of this.allQuestions) {
            const issues = this.identifyQualityIssues(question);
            
            if (issues.length > 0) {
                this.qualityIssues.push({
                    question: question,
                    issues: issues
                });
            } else {
                this.highQualityQuestions.push(question);
            }
        }
        
        console.log(`   ✓ Found ${this.qualityIssues.length} questions with quality issues`);
        console.log(`   ✓ Identified ${this.highQualityQuestions.length} high-quality questions`);
    }

    /**
     * Identify quality issues in a question
     */
    identifyQualityIssues(question) {
        const issues = [];
        
        // Check question text
        if (!question.question || question.question.length < 20) {
            issues.push('Question text too short or missing');
        }
        
        if (question.question && question.question.length > 500) {
            issues.push('Question text too long');
        }
        
        // Check for unclear wording
        const unclearPatterns = [
            /\.\.\./,
            /\[.*\]/,
            /TODO/i,
            /FIXME/i,
            /placeholder/i
        ];
        
        if (unclearPatterns.some(pattern => pattern.test(question.question))) {
            issues.push('Contains placeholder or unclear text');
        }
        
        // Check options
        if (!question.options || Object.keys(question.options).length !== 4) {
            issues.push('Does not have exactly 4 options');
        }
        
        if (question.options) {
            const optionKeys = Object.keys(question.options);
            if (!optionKeys.includes('A') || !optionKeys.includes('B') || 
                !optionKeys.includes('C') || !optionKeys.includes('D')) {
                issues.push('Options not properly labeled A, B, C, D');
            }
            
            // Check for very short or very long options
            Object.values(question.options).forEach((option, index) => {
                if (!option || option.length < 5) {
                    issues.push(`Option ${String.fromCharCode(65 + index)} too short`);
                }
                if (option && option.length > 300) {
                    issues.push(`Option ${String.fromCharCode(65 + index)} too long`);
                }
            });
        }
        
        // Check correct answer
        if (!question.correctAnswer || !['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
            issues.push('Invalid or missing correct answer');
        }
        
        // Check explanation
        if (!question.explanation || question.explanation.length < 20) {
            issues.push('Explanation too short or missing');
        }
        
        // Check for incomplete explanations
        if (question.explanation && question.explanation.includes('enhance their.')) {
            issues.push('Incomplete explanation text');
        }
        
        return issues;
    }

    /**
     * Verify answers using social work knowledge base
     */
    async verifyAnswers() {
        console.log('✅ Verifying answers...');
        
        // This would ideally connect to authoritative sources
        // For now, we'll flag questions that need manual review
        const needsReview = [];
        
        for (const question of this.allQuestions) {
            if (this.needsAnswerVerification(question)) {
                needsReview.push(question);
            }
        }
        
        console.log(`   ✓ ${needsReview.length} questions flagged for answer verification`);
    }

    /**
     * Check if question needs answer verification
     */
    needsAnswerVerification(question) {
        // Flag questions with potentially problematic content
        const flagPatterns = [
            /always/i,
            /never/i,
            /all of the above/i,
            /none of the above/i
        ];
        
        const questionText = question.question + ' ' + Object.values(question.options).join(' ');
        return flagPatterns.some(pattern => pattern.test(questionText));
    }

    /**
     * Generate comprehensive quality report
     */
    async generateQualityReport() {
        console.log('📊 Generating quality report...');
        
        const report = {
            summary: {
                totalQuestions: this.allQuestions.length,
                duplicates: this.duplicates.length,
                qualityIssues: this.qualityIssues.length,
                highQualityQuestions: this.highQualityQuestions.length,
                reviewedAt: new Date().toISOString()
            },
            duplicates: this.duplicates.slice(0, 20), // First 20 for review
            qualityIssues: this.qualityIssues.slice(0, 50), // First 50 for review
            recommendations: this.generateRecommendations()
        };
        
        const reportPath = path.join(this.outputDir, 'quality-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('\n📋 QUALITY REVIEW SUMMARY:');
        console.log(`   📊 Total questions analyzed: ${report.summary.totalQuestions}`);
        console.log(`   🔍 Duplicates found: ${report.summary.duplicates}`);
        console.log(`   ⚠️  Quality issues: ${report.summary.qualityIssues}`);
        console.log(`   ✅ High-quality questions: ${report.summary.highQualityQuestions}`);
        console.log(`   💾 Report saved to: quality-report.json`);
        
        return report;
    }

    /**
     * Generate recommendations for improvement
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.duplicates.length > 0) {
            recommendations.push(`Remove ${this.duplicates.length} duplicate questions`);
        }
        
        if (this.qualityIssues.length > 0) {
            recommendations.push(`Fix ${this.qualityIssues.length} questions with quality issues`);
        }
        
        const targetQuestions = 500; // 5 sets × 100 questions
        if (this.highQualityQuestions.length >= targetQuestions) {
            recommendations.push(`Select best ${targetQuestions} questions from ${this.highQualityQuestions.length} high-quality questions`);
        } else {
            recommendations.push(`Need to improve ${targetQuestions - this.highQualityQuestions.length} more questions to reach target of ${targetQuestions}`);
        }
        
        return recommendations;
    }
}

// Run quality review if script is executed directly
if (require.main === module) {
    const reviewer = new QualityReviewer();
    reviewer.init().catch(error => {
        console.error('💥 Fatal error during quality review:', error);
        process.exit(1);
    });
}

module.exports = QualityReviewer;
