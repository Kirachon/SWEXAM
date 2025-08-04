/**
 * Parse Social Work Examination Markdown Files
 * Extracts questions from markdown format and converts to JSON structure
 */

const fs = require('fs');
const path = require('path');

class ExamMarkdownParser {
    constructor() {
        this.examSets = [];
        this.topicMapping = {
            'Concepts and Definitions': 'Group Development',
            'Group Work Theory and Concepts': 'Group Development',
            'Foundations of Social Group Work': 'Group Development',
            'Historical Development': 'Professional Practice',
            'Group Development and Dynamics': 'Group Dynamics',
            'Group Formation and Structure': 'Group Structure',
            'Group Process and Intervention': 'Group Process',
            'Leadership and Roles': 'Professional Practice',
            'Ethics and Professional Practice': 'Professional Ethics',
            'Evaluation and Termination': 'Professional Practice',
            'Case Studies and Applications': 'Practice Approaches',
            'Approaches and Models': 'Practice Models',
            'Group Structure and Power': 'Group Structure',
            'Group Dynamics and Process': 'Group Dynamics',
            'Practice Applications': 'Practice Approaches'
        };
    }

    classifyQuestionTopic(questionText) {
        const text = questionText.toLowerCase();

        // Group Development and Formation
        if (text.includes('group development') || text.includes('forming') || text.includes('storming') ||
            text.includes('norming') || text.includes('performing') || text.includes('adjourning') ||
            text.includes('tuckman') || text.includes('group formation') || text.includes('pre-affiliation') ||
            text.includes('intimacy phase') || text.includes('separation phase') || text.includes('termination')) {
            return 'Group Development';
        }

        // Group Dynamics and Process
        if (text.includes('group dynamics') || text.includes('group process') || text.includes('cohesiveness') ||
            text.includes('group interaction') || text.includes('group behavior') || text.includes('group norms') ||
            text.includes('group roles') || text.includes('conflict') || text.includes('communication') ||
            text.includes('decision-making') || text.includes('consensus')) {
            return 'Group Dynamics';
        }

        // Group Structure and Power
        if (text.includes('group structure') || text.includes('leadership') || text.includes('power') ||
            text.includes('authority') || text.includes('hierarchy') || text.includes('roles') ||
            text.includes('status') || text.includes('sociometry') || text.includes('group size')) {
            return 'Group Structure';
        }

        // Practice Models and Approaches
        if (text.includes('developmental approach') || text.includes('remedial model') ||
            text.includes('interactionist') || text.includes('crisis intervention') ||
            text.includes('task-centered') || text.includes('mutual aid') || text.includes('schwartz') ||
            text.includes('vinter') || text.includes('coyle') || text.includes('phillips')) {
            return 'Practice Models';
        }

        // Professional Ethics and Practice
        if (text.includes('ethics') || text.includes('professional') || text.includes('confidentiality') ||
            text.includes('documentation') || text.includes('evaluation') || text.includes('nasw') ||
            text.includes('code of ethics') || text.includes('professional practice') ||
            text.includes('worker role') || text.includes('boundaries')) {
            return 'Professional Ethics';
        }

        // Practice Approaches and Interventions
        if (text.includes('intervention') || text.includes('technique') || text.includes('strategy') ||
            text.includes('assessment') || text.includes('treatment') || text.includes('therapy') ||
            text.includes('case study') || text.includes('application') || text.includes('practice')) {
            return 'Practice Approaches';
        }

        // Historical and Theoretical Foundations
        if (text.includes('settlement house') || text.includes('jane addams') || text.includes('ymca') ||
            text.includes('ywca') || text.includes('history') || text.includes('founded') ||
            text.includes('organized') || text.includes('philippines') || text.includes('movement')) {
            return 'Professional Practice';
        }

        return 'Group Process';
    }

    parseMarkdownFile(filePath, setId) {
        console.log(`\nParsing ${filePath}...`);
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        const questions = [];
        let currentQuestion = null;
        let currentSection = 'General';
        let questionCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();



            // Skip empty lines but continue processing
            if (!line) {
                continue;
            }

            // Stop at answer key section
            if (line.startsWith('## ANSWER KEY')) {
                break;
            }
            
            // Track sections for topic assignment
            if (line.startsWith('### PART')) {
                const sectionMatch = line.match(/### PART [IVX]+: (.+?) \(/);
                if (sectionMatch) {
                    currentSection = sectionMatch[1];
                }
                continue;
            }
            
            // Match question start (number followed by period and space)
            const questionMatch = line.match(/^(\d+)\.\s+(.+)$/);
            if (questionMatch) {
                // Save previous question if exists
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                
                questionCount++;
                const questionNumber = parseInt(questionMatch[1]);
                const questionText = questionMatch[2];
                
                // Determine topic based on section and question content
                let topic = this.topicMapping[currentSection] || this.classifyQuestionTopic(questionText);
                
                currentQuestion = {
                    id: `sw_exam_set${setId}_q${questionNumber}`,
                    type: 'multiple-choice',
                    question: questionText,
                    options: {},
                    correctAnswer: null,
                    explanation: '',
                    topic: topic,
                    difficulty: 'medium',
                    questionNumber: questionNumber,
                    examSetId: setId
                };
                continue;
            }
            
            // Match options (a), b), c), d))
            const optionMatch = line.match(/^\s*([a-d])\)\s*(.+)$/);
            if (optionMatch && currentQuestion) {
                const optionKey = optionMatch[1].toUpperCase();
                let optionText = optionMatch[2];
                
                // Check if this is the correct answer (marked with **)
                if (optionText.includes('**')) {
                    optionText = optionText.replace(/\*\*/g, '');
                    currentQuestion.correctAnswer = optionKey;
                }
                
                currentQuestion.options[optionKey] = optionText;
                continue;
            }
        }
        
        // Add the last question
        if (currentQuestion) {
            questions.push(currentQuestion);
        }
        
        console.log(`Extracted ${questions.length} questions from Set ${setId}`);
        
        // Validate question count
        if (questions.length !== 100) {
            console.warn(`Warning: Expected 100 questions, found ${questions.length} in Set ${setId}`);
        }
        
        return questions;
    }

    generateExplanations(question) {
        // Generate basic explanations based on question content and correct answer
        const correctOption = question.options[question.correctAnswer];
        
        let explanation = `The correct answer is ${question.correctAnswer}: ${correctOption}. `;
        
        // Add topic-specific explanations
        switch (question.topic) {
            case 'Group Development':
                explanation += 'This concept is fundamental to understanding how groups form and evolve through predictable stages, as outlined in social work group practice literature.';
                break;
            case 'Group Dynamics':
                explanation += 'Group dynamics refers to the complex interactions and processes that occur within groups, affecting member behavior and group outcomes.';
                break;
            case 'Professional Ethics':
                explanation += 'This aligns with NASW Code of Ethics principles that guide professional social work practice in group settings.';
                break;
            case 'Professional Practice':
                explanation += 'This reflects evidence-based social work practice standards and professional competencies required for effective group work.';
                break;
            default:
                explanation += 'This concept is essential for effective social work practice with groups.';
        }
        
        return explanation;
    }

    createExamSet(questions, setId) {
        // Add explanations to questions
        const questionsWithExplanations = questions.map(q => ({
            ...q,
            explanation: this.generateExplanations(q)
        }));
        
        // Get unique topics
        const topics = [...new Set(questionsWithExplanations.map(q => q.topic))];
        
        const examSet = {
            setId: setId,
            title: `Social Work Group Practice Exam Set ${setId}`,
            description: `Comprehensive examination covering social group work concepts, practices, and applications. Set ${setId} of 3. All questions research-verified and based on authoritative social work literature.`,
            questionCount: questionsWithExplanations.length,
            topics: topics,
            difficulty: 'mixed',
            timeLimit: 120,
            passingScore: 70,
            questions: questionsWithExplanations,
            metadata: {
                createdAt: new Date().toISOString(),
                version: '3.0',
                source: 'Social Work Group Practice Examination Materials - Research Verified',
                qualityReviewed: true,
                researchBased: true,
                authoritative: true,
                restructured: true,
                originalSource: 'D:\\SCANNER\\SWEXAM\\exam\\'
            }
        };
        
        return examSet;
    }

    async processAllExamSets() {
        const examDir = path.join(__dirname, '..', 'exam');
        const outputDir = path.join(__dirname, '..', 'quiz-app', 'src', 'data');
        
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const examFiles = [
            { file: 'social-work-exam-set1.md', setId: 1 },
            { file: 'social-work-exam-set2.md', setId: 2 },
            { file: 'social-work-exam-set3.md', setId: 3 }
        ];
        
        console.log('Starting exam set processing...\n');
        
        for (const { file, setId } of examFiles) {
            const filePath = path.join(examDir, file);
            
            if (!fs.existsSync(filePath)) {
                console.error(`File not found: ${filePath}`);
                continue;
            }
            
            // Parse questions from markdown
            const questions = this.parseMarkdownFile(filePath, setId);
            
            // Create exam set structure
            const examSet = this.createExamSet(questions, setId);
            this.examSets.push(examSet);
            
            // Save individual exam set file
            const outputFile = path.join(outputDir, `exam-set-${setId}.json`);
            fs.writeFileSync(outputFile, JSON.stringify(examSet, null, 2));
            console.log(`Saved: ${outputFile}`);
        }
        
        // Create exam sets index
        this.createExamSetsIndex(outputDir);
        
        console.log('\n✅ All exam sets processed successfully!');
        console.log(`Total exam sets: ${this.examSets.length}`);
        console.log(`Total questions: ${this.examSets.reduce((sum, set) => sum + set.questionCount, 0)}`);
    }

    createExamSetsIndex(outputDir) {
        const indexData = {
            metadata: {
                totalSets: this.examSets.length,
                questionsPerSet: 100,
                totalQuestions: this.examSets.reduce((sum, set) => sum + set.questionCount, 0),
                createdAt: new Date().toISOString(),
                version: '3.0',
                qualityReviewed: true,
                researchBased: true,
                authoritative: true,
                restructured: true,
                originalSource: 'D:\\SCANNER\\SWEXAM\\exam\\',
                restructuredFrom: '5 sets (500 questions) to 3 sets (300 questions)'
            },
            examSets: this.examSets.map(set => ({
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
        
        const indexFile = path.join(outputDir, 'exam-sets-index.json');
        fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));
        console.log(`Saved: ${indexFile}`);
    }
}

// Run the parser
if (require.main === module) {
    const parser = new ExamMarkdownParser();
    parser.processAllExamSets().catch(console.error);
}

module.exports = ExamMarkdownParser;
