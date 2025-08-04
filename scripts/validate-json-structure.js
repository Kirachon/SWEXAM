/**
 * Validate JSON Structure and Format Consistency
 * Ensures all exam set files follow the correct structure for the quiz application
 */

const fs = require('fs');
const path = require('path');

class JSONValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    validateExamSetStructure(examSet, setId) {
        const requiredFields = ['setId', 'title', 'description', 'questionCount', 'topics', 'difficulty', 'timeLimit', 'passingScore', 'questions', 'metadata'];
        const requiredQuestionFields = ['id', 'type', 'question', 'options', 'correctAnswer', 'explanation', 'topic', 'difficulty', 'questionNumber', 'examSetId'];
        
        console.log(`\n🔍 Validating Exam Set ${setId} Structure...`);
        
        // Validate top-level structure
        for (const field of requiredFields) {
            if (!examSet.hasOwnProperty(field)) {
                this.errors.push(`Set ${setId}: Missing required field '${field}'`);
            }
        }
        
        // Validate setId consistency
        if (examSet.setId !== setId) {
            this.errors.push(`Set ${setId}: setId mismatch (expected ${setId}, got ${examSet.setId})`);
        }
        
        // Validate question count
        if (examSet.questionCount !== 100) {
            this.errors.push(`Set ${setId}: Expected 100 questions, got ${examSet.questionCount}`);
        }
        
        if (examSet.questions.length !== examSet.questionCount) {
            this.errors.push(`Set ${setId}: Question count mismatch (metadata: ${examSet.questionCount}, actual: ${examSet.questions.length})`);
        }
        
        // Validate each question
        examSet.questions.forEach((question, index) => {
            const questionNum = index + 1;
            
            // Check required fields
            for (const field of requiredQuestionFields) {
                if (!question.hasOwnProperty(field)) {
                    this.errors.push(`Set ${setId}, Q${questionNum}: Missing required field '${field}'`);
                }
            }
            
            // Validate question numbering
            if (question.questionNumber !== questionNum) {
                this.errors.push(`Set ${setId}, Q${questionNum}: Question number mismatch (expected ${questionNum}, got ${question.questionNumber})`);
            }
            
            // Validate exam set ID consistency
            if (question.examSetId !== setId) {
                this.errors.push(`Set ${setId}, Q${questionNum}: examSetId mismatch (expected ${setId}, got ${question.examSetId})`);
            }
            
            // Validate options structure
            if (question.options) {
                const optionKeys = Object.keys(question.options);
                const expectedKeys = ['A', 'B', 'C', 'D'];
                
                if (optionKeys.length !== 4) {
                    this.errors.push(`Set ${setId}, Q${questionNum}: Expected 4 options, got ${optionKeys.length}`);
                }
                
                for (const key of expectedKeys) {
                    if (!question.options.hasOwnProperty(key)) {
                        this.errors.push(`Set ${setId}, Q${questionNum}: Missing option '${key}'`);
                    }
                }
                
                // Validate correct answer
                if (!expectedKeys.includes(question.correctAnswer)) {
                    this.errors.push(`Set ${setId}, Q${questionNum}: Invalid correct answer '${question.correctAnswer}' (must be A, B, C, or D)`);
                }
            }
            
            // Validate explanation exists and has content
            if (!question.explanation || question.explanation.trim().length === 0) {
                this.errors.push(`Set ${setId}, Q${questionNum}: Missing or empty explanation`);
            }
            
            // Check for research citations in explanation
            if (question.explanation && !question.explanation.includes('Citation:')) {
                this.warnings.push(`Set ${setId}, Q${questionNum}: Explanation lacks research citation`);
            }
        });
        
        console.log(`   ✅ Structure validation complete for Set ${setId}`);
    }

    validateIndexStructure(indexData) {
        console.log(`\n🔍 Validating Index File Structure...`);
        
        const requiredFields = ['metadata', 'examSets'];
        const requiredMetadataFields = ['totalSets', 'questionsPerSet', 'totalQuestions', 'createdAt', 'version'];
        const requiredExamSetFields = ['setId', 'title', 'description', 'questionCount', 'topics', 'difficulty', 'timeLimit', 'passingScore', 'filename'];
        
        // Validate top-level structure
        for (const field of requiredFields) {
            if (!indexData.hasOwnProperty(field)) {
                this.errors.push(`Index: Missing required field '${field}'`);
            }
        }
        
        // Validate metadata
        if (indexData.metadata) {
            for (const field of requiredMetadataFields) {
                if (!indexData.metadata.hasOwnProperty(field)) {
                    this.errors.push(`Index metadata: Missing required field '${field}'`);
                }
            }
            
            // Validate counts
            if (indexData.metadata.totalSets !== 3) {
                this.errors.push(`Index: Expected totalSets = 3, got ${indexData.metadata.totalSets}`);
            }
            
            if (indexData.metadata.totalQuestions !== 300) {
                this.errors.push(`Index: Expected totalQuestions = 300, got ${indexData.metadata.totalQuestions}`);
            }
            
            if (indexData.metadata.questionsPerSet !== 100) {
                this.errors.push(`Index: Expected questionsPerSet = 100, got ${indexData.metadata.questionsPerSet}`);
            }
        }
        
        // Validate exam sets array
        if (indexData.examSets) {
            if (indexData.examSets.length !== 3) {
                this.errors.push(`Index: Expected 3 exam sets, got ${indexData.examSets.length}`);
            }
            
            indexData.examSets.forEach((examSet, index) => {
                const expectedSetId = index + 1;
                
                for (const field of requiredExamSetFields) {
                    if (!examSet.hasOwnProperty(field)) {
                        this.errors.push(`Index examSet ${expectedSetId}: Missing required field '${field}'`);
                    }
                }
                
                if (examSet.setId !== expectedSetId) {
                    this.errors.push(`Index examSet ${expectedSetId}: setId mismatch (expected ${expectedSetId}, got ${examSet.setId})`);
                }
                
                if (examSet.questionCount !== 100) {
                    this.errors.push(`Index examSet ${expectedSetId}: Expected questionCount = 100, got ${examSet.questionCount}`);
                }
            });
        }
        
        console.log(`   ✅ Index structure validation complete`);
    }

    async validateAllFiles() {
        const dataDir = path.join(__dirname, '..', 'quiz-app', 'src', 'data');
        
        console.log('🔬 JSON STRUCTURE VALIDATION\n');
        
        // Validate index file
        const indexPath = path.join(dataDir, 'exam-sets-index.json');
        if (fs.existsSync(indexPath)) {
            try {
                const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
                this.validateIndexStructure(indexData);
            } catch (error) {
                this.errors.push(`Index file: JSON parsing error - ${error.message}`);
            }
        } else {
            this.errors.push('Index file: exam-sets-index.json not found');
        }
        
        // Validate each exam set file
        for (let setId = 1; setId <= 3; setId++) {
            const filePath = path.join(dataDir, `exam-set-${setId}.json`);
            
            if (fs.existsSync(filePath)) {
                try {
                    const examSet = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    this.validateExamSetStructure(examSet, setId);
                } catch (error) {
                    this.errors.push(`Set ${setId}: JSON parsing error - ${error.message}`);
                }
            } else {
                this.errors.push(`Set ${setId}: exam-set-${setId}.json not found`);
            }
        }
        
        // Report results
        console.log('\n📊 VALIDATION RESULTS');
        console.log(`Errors: ${this.errors.length}`);
        console.log(`Warnings: ${this.warnings.length}`);
        
        if (this.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.errors.forEach(error => console.log(`  • ${error}`));
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            this.warnings.forEach(warning => console.log(`  • ${warning}`));
        }
        
        if (this.errors.length === 0) {
            console.log('\n✅ ALL VALIDATIONS PASSED');
            console.log('JSON structure is consistent and compatible with the quiz application.');
        } else {
            console.log('\n❌ VALIDATION FAILED');
            console.log('Please fix the errors before proceeding.');
        }
        
        return this.errors.length === 0;
    }
}

if (require.main === module) {
    const validator = new JSONValidator();
    validator.validateAllFiles().catch(console.error);
}

module.exports = JSONValidator;
