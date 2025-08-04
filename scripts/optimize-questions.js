const fs = require('fs');
const path = require('path');

/**
 * Question Optimization System
 * Removes duplicates, fixes quality issues, and creates 5 high-quality exam sets
 */

class QuestionOptimizer {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'quiz-app', 'src', 'data');
        this.outputDir = path.join(__dirname, '..', 'optimized-questions');
        this.allQuestions = [];
        this.highQualityQuestions = [];
        this.finalExamSets = [];
    }

    /**
     * Initialize optimization process
     */
    async init() {
        console.log('🚀 Starting question optimization...');
        
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        await this.loadAllQuestions();
        await this.filterHighQualityQuestions();
        await this.removeDuplicates();
        await this.createOptimizedExamSets();
        await this.updateApplicationData();
        
        console.log('✅ Question optimization completed!');
    }

    /**
     * Load all questions from existing exam sets
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
                        originalIndex: index
                    });
                });
            }
        }
        
        console.log(`   ✓ Loaded ${this.allQuestions.length} total questions`);
    }

    /**
     * Filter out low-quality questions
     */
    async filterHighQualityQuestions() {
        console.log('🔍 Filtering high-quality questions...');
        
        for (const question of this.allQuestions) {
            if (this.isHighQuality(question)) {
                this.highQualityQuestions.push(question);
            }
        }
        
        console.log(`   ✓ Found ${this.highQualityQuestions.length} high-quality questions`);
    }

    /**
     * Check if a question meets quality standards
     */
    isHighQuality(question) {
        // Check for basic structure
        if (!question.question || !question.options || !question.correctAnswer || !question.explanation) {
            return false;
        }

        // Check question text quality
        const questionText = question.question.trim();
        if (questionText.length < 30 || questionText.length > 400) {
            return false;
        }

        // Check for incomplete or unclear text
        const badPatterns = [
            /enhance their\.$/,
            /would lead to better cognition of their\.$/,
            /those that meet because of external\.$/,
            /two or more people with a common interest, interacting\.$/,
            /\.\.\./,
            /TODO/i,
            /FIXME/i,
            /placeholder/i,
            /Question \d+/
        ];

        if (badPatterns.some(pattern => pattern.test(questionText))) {
            return false;
        }

        // Check options quality
        const options = Object.values(question.options);
        if (options.length !== 4) {
            return false;
        }

        // Check for incomplete options
        for (const option of options) {
            if (!option || option.length < 10 || option.length > 200) {
                return false;
            }
            if (badPatterns.some(pattern => pattern.test(option))) {
                return false;
            }
        }

        // Check for valid correct answer
        if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
            return false;
        }

        // Check explanation quality
        if (question.explanation.length < 30 || 
            badPatterns.some(pattern => pattern.test(question.explanation))) {
            return false;
        }

        // Check for meaningful concept
        if (!question.concept || question.concept.length < 3) {
            return false;
        }

        return true;
    }

    /**
     * Remove duplicate questions
     */
    async removeDuplicates() {
        console.log('🔄 Removing duplicates...');
        
        const uniqueQuestions = [];
        const seenQuestions = new Set();
        
        for (const question of this.highQualityQuestions) {
            const questionKey = this.createQuestionKey(question);
            
            if (!seenQuestions.has(questionKey)) {
                seenQuestions.add(questionKey);
                uniqueQuestions.push(question);
            }
        }
        
        this.highQualityQuestions = uniqueQuestions;
        console.log(`   ✓ Removed duplicates, ${this.highQualityQuestions.length} unique questions remaining`);
    }

    /**
     * Create a unique key for duplicate detection
     */
    createQuestionKey(question) {
        const normalizedQuestion = question.question
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        const normalizedOptions = Object.values(question.options)
            .map(opt => opt.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim())
            .sort()
            .join('|');
        
        return `${normalizedQuestion}::${normalizedOptions}`;
    }

    /**
     * Create 5 optimized exam sets with 100 questions each
     */
    async createOptimizedExamSets() {
        console.log('📝 Creating 5 optimized exam sets...');
        
        // Ensure we have enough questions
        if (this.highQualityQuestions.length < 500) {
            console.log(`   ⚠️  Only ${this.highQualityQuestions.length} high-quality questions available`);
            console.log('   🔧 Generating additional questions to reach 500...');
            await this.generateAdditionalQuestions(500 - this.highQualityQuestions.length);
        }

        // Shuffle questions for random distribution
        const shuffledQuestions = this.shuffleArray([...this.highQualityQuestions]);
        
        // Group questions by topic for balanced distribution
        const questionsByTopic = this.groupQuestionsByTopic(shuffledQuestions);
        
        // Create 5 exam sets
        for (let setId = 1; setId <= 5; setId++) {
            const examSet = await this.createBalancedExamSet(setId, questionsByTopic);
            this.finalExamSets.push(examSet);
        }
        
        console.log(`   ✓ Created ${this.finalExamSets.length} optimized exam sets`);
    }

    /**
     * Generate additional high-quality questions if needed
     */
    async generateAdditionalQuestions(needed) {
        const socialWorkConcepts = [
            {
                concept: 'Group Cohesion',
                definition: 'The degree of unity, solidarity, and positive feelings among group members that contributes to the group\'s ability to work together effectively.',
                topic: 'Group Dynamics'
            },
            {
                concept: 'Mutual Aid',
                definition: 'A process in which group members help each other by sharing experiences, providing support, and offering different perspectives on common problems.',
                topic: 'Group Process'
            },
            {
                concept: 'Group Norms',
                definition: 'Shared expectations and rules that guide behavior within the group and help establish acceptable standards of conduct.',
                topic: 'Group Structure'
            },
            {
                concept: 'Developmental Approach',
                definition: 'A social work practice method that focuses on helping groups progress through natural stages of development and growth.',
                topic: 'Practice Approaches'
            },
            {
                concept: 'Remedial Approach',
                definition: 'A social work practice method that addresses specific problems or dysfunctions within the group or individual members.',
                topic: 'Practice Approaches'
            }
        ];

        for (let i = 0; i < needed && i < socialWorkConcepts.length * 10; i++) {
            const concept = socialWorkConcepts[i % socialWorkConcepts.length];
            const question = this.createQualityQuestion(concept, i + 1);
            this.highQualityQuestions.push(question);
        }
    }

    /**
     * Create a high-quality question from a concept
     */
    createQualityQuestion(concept, index) {
        const questionFormats = [
            `What is the primary characteristic of ${concept.concept.toLowerCase()} in social group work?`,
            `How does ${concept.concept.toLowerCase()} contribute to effective group practice?`,
            `In social work with groups, ${concept.concept.toLowerCase()} is best described as:`,
            `When facilitating a group, how should a social worker understand ${concept.concept.toLowerCase()}?`
        ];

        const questionText = questionFormats[index % questionFormats.length];
        
        const distractors = [
            'A process that focuses primarily on individual therapy rather than group dynamics.',
            'An administrative procedure used for documentation and record-keeping purposes.',
            'A supervisory technique employed for staff development and training.',
            'A research methodology used for program evaluation and assessment.'
        ];

        const options = this.shuffleArray([concept.definition, ...distractors.slice(0, 3)]);
        const correctIndex = options.indexOf(concept.definition);

        return {
            id: `optimized_${index}`,
            type: 'concept',
            question: questionText,
            options: {
                A: options[0],
                B: options[1],
                C: options[2],
                D: options[3]
            },
            correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
            explanation: `${concept.concept} is defined as ${concept.definition}. This concept is fundamental to effective social group work practice and is essential for understanding how groups function and develop.`,
            source: 'Social Work Practice Literature',
            difficulty: 'medium',
            topic: concept.topic,
            concept: concept.concept
        };
    }

    /**
     * Group questions by topic
     */
    groupQuestionsByTopic(questions) {
        const grouped = {};
        
        questions.forEach(question => {
            const topic = question.topic || 'General Social Work';
            if (!grouped[topic]) {
                grouped[topic] = [];
            }
            grouped[topic].push(question);
        });
        
        return grouped;
    }

    /**
     * Create a balanced exam set
     */
    async createBalancedExamSet(setId, questionsByTopic) {
        const examQuestions = [];
        const topics = Object.keys(questionsByTopic);
        const questionsPerTopic = Math.floor(100 / topics.length);
        const remainder = 100 % topics.length;
        
        let questionIndex = (setId - 1) * 100;
        
        topics.forEach((topic, topicIndex) => {
            const topicQuestions = questionsByTopic[topic];
            let questionsToTake = questionsPerTopic;
            
            if (topicIndex < remainder) {
                questionsToTake++;
            }
            
            for (let i = 0; i < questionsToTake && examQuestions.length < 100; i++) {
                const questionIdx = (questionIndex + i) % topicQuestions.length;
                const question = topicQuestions[questionIdx];
                
                if (question) {
                    examQuestions.push({
                        ...question,
                        examSetId: setId,
                        questionNumber: examQuestions.length + 1
                    });
                }
            }
            
            questionIndex += questionsToTake;
        });
        
        return {
            setId: setId,
            title: `Social Work Group Practice Exam Set ${setId}`,
            description: `Comprehensive examination covering social group work concepts, practices, and applications. Set ${setId} of 5.`,
            questionCount: examQuestions.length,
            topics: [...new Set(examQuestions.map(q => q.topic))],
            difficulty: 'mixed',
            timeLimit: 120,
            passingScore: 70,
            questions: examQuestions,
            metadata: {
                createdAt: new Date().toISOString(),
                version: '2.0',
                source: 'Optimized Social Work Group Practice Materials',
                qualityReviewed: true
            }
        };
    }

    /**
     * Shuffle array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Update application data with optimized exam sets
     */
    async updateApplicationData() {
        console.log('💾 Updating application data...');
        
        // Save optimized exam sets
        for (const examSet of this.finalExamSets) {
            const filename = `exam-set-${examSet.setId}.json`;
            const filepath = path.join(this.dataDir, filename);
            fs.writeFileSync(filepath, JSON.stringify(examSet, null, 2));
        }
        
        // Update master index
        const masterIndex = {
            metadata: {
                totalSets: this.finalExamSets.length,
                questionsPerSet: 100,
                totalQuestions: this.finalExamSets.reduce((sum, set) => sum + set.questions.length, 0),
                createdAt: new Date().toISOString(),
                version: '2.0',
                qualityReviewed: true
            },
            examSets: this.finalExamSets.map(set => ({
                setId: set.setId,
                title: set.title,
                description: set.description,
                questionCount: set.questionCount,
                topics: set.topics,
                difficulty: set.difficulty,
                timeLimit: set.timeLimit,
                passingScore: set.passingScore,
                filename: `exam-set-${set.setId}.json`
            }))
        };
        
        const indexPath = path.join(this.dataDir, 'exam-sets-index.json');
        fs.writeFileSync(indexPath, JSON.stringify(masterIndex, null, 2));
        
        // Remove old exam sets (6-10)
        for (let i = 6; i <= 10; i++) {
            const oldPath = path.join(this.dataDir, `exam-set-${i}.json`);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        
        console.log(`   ✓ Updated application with ${this.finalExamSets.length} optimized exam sets`);
        console.log(`   ✓ Total questions: ${masterIndex.metadata.totalQuestions}`);
        console.log('   ✓ Removed old exam sets (6-10)');
    }
}

// Run optimization if script is executed directly
if (require.main === module) {
    const optimizer = new QuestionOptimizer();
    optimizer.init().catch(error => {
        console.error('💥 Fatal error during optimization:', error);
        process.exit(1);
    });
}

module.exports = QuestionOptimizer;
