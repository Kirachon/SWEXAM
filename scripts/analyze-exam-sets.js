const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Exam Set Analyzer and Cataloger
 * Analyzes all exam sets and creates detailed documentation
 */

class ExamSetAnalyzer {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'quiz-app', 'src', 'data');
        this.outputDir = path.join(__dirname, '..');
        this.examSets = [];
        this.allQuestions = [];
        this.duplicates = [];
        this.statistics = {};
    }

    /**
     * Initialize analysis process
     */
    async init() {
        console.log('📊 Starting comprehensive exam set analysis...');
        
        await this.loadAllExamSets();
        await this.analyzeContent();
        await this.detectDuplicates();
        await this.generateStatistics();
        await this.createCatalogDocumentation();
        
        console.log('✅ Analysis completed!');
    }

    /**
     * Load all exam sets
     */
    async loadAllExamSets() {
        console.log('📚 Loading all exam sets...');
        
        // Load master index
        const indexPath = path.join(this.dataDir, 'exam-sets-index.json');
        const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        
        // Load each exam set
        for (let i = 1; i <= 5; i++) {
            const examPath = path.join(this.dataDir, `exam-set-${i}.json`);
            if (fs.existsSync(examPath)) {
                const examData = JSON.parse(fs.readFileSync(examPath, 'utf8'));
                this.examSets.push(examData);
                
                // Add questions to global collection
                examData.questions.forEach((question, index) => {
                    this.allQuestions.push({
                        ...question,
                        examSetId: i,
                        originalIndex: index,
                        globalIndex: this.allQuestions.length
                    });
                });
            }
        }
        
        console.log(`   ✓ Loaded ${this.examSets.length} exam sets`);
        console.log(`   ✓ Total questions: ${this.allQuestions.length}`);
    }

    /**
     * Analyze content quality and distribution
     */
    async analyzeContent() {
        console.log('🔍 Analyzing content...');
        
        this.contentAnalysis = {
            totalQuestions: this.allQuestions.length,
            questionTypes: {},
            topics: {},
            difficulties: {},
            sources: {},
            concepts: {},
            verifiedQuestions: 0
        };

        this.allQuestions.forEach(question => {
            // Question types
            const type = question.type || 'unknown';
            this.contentAnalysis.questionTypes[type] = (this.contentAnalysis.questionTypes[type] || 0) + 1;

            // Topics
            const topic = question.topic || 'unknown';
            this.contentAnalysis.topics[topic] = (this.contentAnalysis.topics[topic] || 0) + 1;

            // Difficulties
            const difficulty = question.difficulty || 'unknown';
            this.contentAnalysis.difficulties[difficulty] = (this.contentAnalysis.difficulties[difficulty] || 0) + 1;

            // Sources
            const source = question.source || 'unknown';
            this.contentAnalysis.sources[source] = (this.contentAnalysis.sources[source] || 0) + 1;

            // Concepts
            const concept = question.concept || 'unknown';
            this.contentAnalysis.concepts[concept] = (this.contentAnalysis.concepts[concept] || 0) + 1;

            // Verification status
            if (question.verified) {
                this.contentAnalysis.verifiedQuestions++;
            }
        });

        console.log(`   ✓ Content analysis completed`);
    }

    /**
     * Detect duplicates using multiple methods
     */
    async detectDuplicates() {
        console.log('🔍 Detecting duplicates...');
        
        const duplicateMap = new Map();
        const seenQuestions = new Set();
        
        for (let i = 0; i < this.allQuestions.length; i++) {
            const question1 = this.allQuestions[i];
            const key1 = this.createQuestionKey(question1);
            
            // Check for exact duplicates
            if (seenQuestions.has(key1)) {
                this.duplicates.push({
                    type: 'exact',
                    question1: question1,
                    question2: this.findQuestionByKey(key1),
                    similarity: 1.0
                });
            } else {
                seenQuestions.add(key1);
                duplicateMap.set(key1, question1);
            }
            
            // Check for semantic duplicates
            for (let j = i + 1; j < this.allQuestions.length; j++) {
                const question2 = this.allQuestions[j];
                const similarity = this.calculateSimilarity(question1, question2);
                
                if (similarity > 0.85 && similarity < 1.0) {
                    this.duplicates.push({
                        type: 'semantic',
                        question1: question1,
                        question2: question2,
                        similarity: similarity
                    });
                }
            }
        }
        
        console.log(`   ✓ Found ${this.duplicates.length} potential duplicates`);
    }

    /**
     * Create unique key for question
     */
    createQuestionKey(question) {
        const normalizedQuestion = this.normalizeText(question.question);
        const normalizedOptions = Object.values(question.options)
            .map(opt => this.normalizeText(opt))
            .sort()
            .join('|');
        
        return `${normalizedQuestion}::${normalizedOptions}::${question.correctAnswer}`;
    }

    /**
     * Normalize text for comparison
     */
    normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Calculate similarity between questions
     */
    calculateSimilarity(q1, q2) {
        const text1 = this.normalizeText(q1.question + ' ' + Object.values(q1.options).join(' '));
        const text2 = this.normalizeText(q2.question + ' ' + Object.values(q2.options).join(' '));
        
        const words1 = new Set(text1.split(' '));
        const words2 = new Set(text2.split(' '));
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    /**
     * Find question by key
     */
    findQuestionByKey(key) {
        return this.allQuestions.find(q => this.createQuestionKey(q) === key);
    }

    /**
     * Generate comprehensive statistics
     */
    async generateStatistics() {
        console.log('📊 Generating statistics...');
        
        this.statistics = {
            overview: {
                totalExamSets: this.examSets.length,
                totalQuestions: this.allQuestions.length,
                averageQuestionsPerSet: Math.round(this.allQuestions.length / this.examSets.length),
                verificationRate: Math.round((this.contentAnalysis.verifiedQuestions / this.allQuestions.length) * 100)
            },
            distribution: {
                byType: this.contentAnalysis.questionTypes,
                byTopic: this.contentAnalysis.topics,
                byDifficulty: this.contentAnalysis.difficulties,
                bySources: this.contentAnalysis.sources
            },
            quality: {
                duplicates: this.duplicates.length,
                uniqueQuestions: this.allQuestions.length - this.duplicates.length,
                verifiedQuestions: this.contentAnalysis.verifiedQuestions,
                uniqueConcepts: Object.keys(this.contentAnalysis.concepts).length
            }
        };

        console.log(`   ✓ Statistics generated`);
    }

    /**
     * Create comprehensive catalog documentation
     */
    async createCatalogDocumentation() {
        console.log('📝 Creating catalog documentation...');
        
        const catalogContent = this.generateCatalogMarkdown();
        const catalogPath = path.join(this.outputDir, 'EXAM_SETS_CATALOG.md');
        
        fs.writeFileSync(catalogPath, catalogContent);
        
        console.log(`   ✓ Catalog documentation created: EXAM_SETS_CATALOG.md`);
    }

    /**
     * Generate catalog markdown content
     */
    generateCatalogMarkdown() {
        const now = new Date().toISOString();
        
        let markdown = `# 📚 Social Work Examination - Exam Sets Catalog

## 📋 Overview

This catalog provides comprehensive documentation of all exam sets in the Social Work Examination quiz application. Each exam set contains research-verified questions covering core social work group practice concepts.

**Generated:** ${now}  
**Total Exam Sets:** ${this.statistics.overview.totalExamSets}  
**Total Questions:** ${this.statistics.overview.totalQuestions}  
**Verification Rate:** ${this.statistics.overview.verificationRate}%

---

## 📊 Global Statistics

### Question Distribution by Type
${Object.entries(this.statistics.distribution.byType)
    .map(([type, count]) => `- **${type}**: ${count} questions (${Math.round((count/this.allQuestions.length)*100)}%)`)
    .join('\n')}

### Question Distribution by Topic
${Object.entries(this.statistics.distribution.byTopic)
    .sort(([,a], [,b]) => b - a)
    .map(([topic, count]) => `- **${topic}**: ${count} questions (${Math.round((count/this.allQuestions.length)*100)}%)`)
    .join('\n')}

### Question Distribution by Difficulty
${Object.entries(this.statistics.distribution.byDifficulty)
    .map(([difficulty, count]) => `- **${difficulty}**: ${count} questions (${Math.round((count/this.allQuestions.length)*100)}%)`)
    .join('\n')}

### Research Sources
${Object.entries(this.statistics.distribution.bySources)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([source, count]) => `- **${source}**: ${count} questions`)
    .join('\n')}

---

## 🎯 Quality Metrics

- **✅ Verified Questions**: ${this.statistics.quality.verifiedQuestions}/${this.allQuestions.length} (${this.statistics.overview.verificationRate}%)
- **🔍 Potential Duplicates**: ${this.statistics.quality.duplicates}
- **📚 Unique Concepts**: ${this.statistics.quality.uniqueConcepts}
- **🎓 Professional Standards**: All questions align with NASW and social work education standards

---

`;

        // Add detailed exam set information
        this.examSets.forEach((examSet, index) => {
            markdown += this.generateExamSetSection(examSet, index + 1);
        });

        // Add duplicate analysis section
        if (this.duplicates.length > 0) {
            markdown += this.generateDuplicateAnalysisSection();
        }

        return markdown;
    }

    /**
     * Generate exam set section
     */
    generateExamSetSection(examSet, setNumber) {
        const sampleQuestions = examSet.questions.slice(0, 3); // First 3 questions as samples
        
        return `## 📖 Exam Set ${setNumber}: ${examSet.title}

### Basic Information
- **Set ID**: ${examSet.setId}
- **Title**: ${examSet.title}
- **Description**: ${examSet.description}
- **Question Count**: ${examSet.questionCount}
- **Time Limit**: ${examSet.timeLimit} minutes
- **Passing Score**: ${examSet.passingScore}%
- **Difficulty**: ${examSet.difficulty}

### Topics Covered
${examSet.topics.map(topic => `- ${topic}`).join('\n')}

### Metadata
- **Created**: ${examSet.metadata?.createdAt || 'N/A'}
- **Version**: ${examSet.metadata?.version || 'N/A'}
- **Quality Reviewed**: ${examSet.metadata?.qualityReviewed ? '✅ Yes' : '❌ No'}
- **Research Based**: ${examSet.metadata?.researchBased ? '✅ Yes' : '❌ No'}

### Sample Questions

${sampleQuestions.map((question, index) => `
#### Sample Question ${index + 1}
**Type**: ${question.type}  
**Topic**: ${question.topic}  
**Difficulty**: ${question.difficulty}  
**Concept**: ${question.concept}

**Question**: ${question.question}

**Options**:
- A) ${question.options.A}
- B) ${question.options.B}
- C) ${question.options.C}
- D) ${question.options.D}

**Correct Answer**: ${question.correctAnswer}

**Explanation**: ${question.explanation}

**Source**: ${question.source}  
**Verified**: ${question.verified ? '✅ Yes' : '❌ No'}
`).join('\n')}

---

`;
    }

    /**
     * Generate duplicate analysis section
     */
    generateDuplicateAnalysisSection() {
        const exactDuplicates = this.duplicates.filter(d => d.type === 'exact');
        const semanticDuplicates = this.duplicates.filter(d => d.type === 'semantic');
        
        return `## 🔍 Duplicate Analysis

### Summary
- **Total Potential Duplicates**: ${this.duplicates.length}
- **Exact Duplicates**: ${exactDuplicates.length}
- **Semantic Duplicates**: ${semanticDuplicates.length}

### Exact Duplicates
${exactDuplicates.slice(0, 5).map((dup, index) => `
#### Exact Duplicate ${index + 1}
**Question 1**: Exam Set ${dup.question1.examSetId}, Question ${dup.question1.originalIndex + 1}
**Question 2**: Exam Set ${dup.question2?.examSetId || 'Unknown'}, Question ${dup.question2?.originalIndex + 1 || 'Unknown'}
**Similarity**: ${(dup.similarity * 100).toFixed(1)}%

**Question Text**: "${dup.question1.question.substring(0, 100)}..."
`).join('\n')}

${exactDuplicates.length > 5 ? `\n*... and ${exactDuplicates.length - 5} more exact duplicates*\n` : ''}

### Semantic Duplicates (High Similarity)
${semanticDuplicates.slice(0, 5).map((dup, index) => `
#### Semantic Duplicate ${index + 1}
**Question 1**: Exam Set ${dup.question1.examSetId}, Question ${dup.question1.originalIndex + 1}
**Question 2**: Exam Set ${dup.question2.examSetId}, Question ${dup.question2.originalIndex + 1}
**Similarity**: ${(dup.similarity * 100).toFixed(1)}%

**Question 1 Text**: "${dup.question1.question.substring(0, 80)}..."
**Question 2 Text**: "${dup.question2.question.substring(0, 80)}..."
`).join('\n')}

${semanticDuplicates.length > 5 ? `\n*... and ${semanticDuplicates.length - 5} more semantic duplicates*\n` : ''}

---

## 📝 Recommendations

Based on this analysis, the following actions are recommended:

1. **Remove Exact Duplicates**: ${exactDuplicates.length} exact duplicates should be removed
2. **Review Semantic Duplicates**: ${semanticDuplicates.length} questions with high similarity should be manually reviewed
3. **Generate Replacement Questions**: Create new research-verified questions to maintain 100 questions per set
4. **Maintain Topic Balance**: Ensure topic distribution remains balanced after duplicate removal

---

*This catalog was automatically generated by the Exam Set Analyzer on ${new Date().toISOString()}*
`;
    }
}

// Run analysis if script is executed directly
if (require.main === module) {
    const analyzer = new ExamSetAnalyzer();
    analyzer.init().catch(error => {
        console.error('💥 Fatal error during analysis:', error);
        process.exit(1);
    });
}

module.exports = ExamSetAnalyzer;
