const fs = require('fs');
const path = require('path');

/**
 * Question Expansion System
 * Expands the question set to reach 1000 questions by creating more variations
 * and extracting additional content from the PDF materials
 */

class QuestionExpander {
    constructor() {
        this.contentDir = path.join(__dirname, '..', 'extracted-content');
        this.questionsDir = path.join(__dirname, '..', 'generated-questions');
        this.outputDir = path.join(__dirname, '..', 'expanded-questions');
        this.existingQuestions = [];
        this.newQuestions = [];
        this.contentData = {};
        this.usedConcepts = new Set();
    }

    /**
     * Initialize question expansion
     */
    async init() {
        console.log('🚀 Starting question expansion to reach 1000 questions...');
        
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        await this.loadExistingQuestions();
        await this.loadContentData();
        await this.expandQuestionSet();
        await this.saveExpandedQuestions();
        
        console.log('✅ Question expansion completed!');
    }

    /**
     * Load existing questions
     */
    async loadExistingQuestions() {
        console.log('📚 Loading existing questions...');
        
        const questionsPath = path.join(this.questionsDir, 'generated-questions.json');
        const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
        this.existingQuestions = data.questions;
        
        // Track used concepts
        this.existingQuestions.forEach(q => {
            if (q.concept) this.usedConcepts.add(q.concept.toLowerCase());
        });
        
        console.log(`   ✓ Loaded ${this.existingQuestions.length} existing questions`);
    }

    /**
     * Load content data
     */
    async loadContentData() {
        console.log('📖 Loading content data...');
        
        const files = fs.readdirSync(this.contentDir);
        const textFiles = files.filter(file => file.endsWith('.txt'));
        
        for (const file of textFiles) {
            const filePath = path.join(this.contentDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const key = file.replace('.txt', '');
            this.contentData[key] = {
                content: content,
                lines: content.split('\n'),
                filename: file
            };
        }
        
        console.log(`   ✓ Loaded ${textFiles.length} content files`);
    }

    /**
     * Expand question set to reach 1000 questions
     */
    async expandQuestionSet() {
        console.log('🔨 Expanding question set...');
        
        const targetTotal = 1000;
        const currentCount = this.existingQuestions.length;
        const needed = targetTotal - currentCount;
        
        console.log(`   📊 Current: ${currentCount}, Target: ${targetTotal}, Need: ${needed}`);
        
        // Strategy: Create multiple variations and extract more content
        let generated = 0;
        
        // 1. Create variations of existing questions (30%)
        generated += await this.createQuestionVariations(Math.floor(needed * 0.3));
        
        // 2. Extract more concepts from content (40%)
        generated += await this.extractAdditionalConcepts(Math.floor(needed * 0.4));
        
        // 3. Create scenario variations (20%)
        generated += await this.createScenarioVariations(Math.floor(needed * 0.2));
        
        // 4. Fill remaining with practice questions (10%)
        generated += await this.createPracticeQuestions(needed - generated);
        
        console.log(`   ✓ Generated ${generated} additional questions`);
    }

    /**
     * Create variations of existing questions
     */
    async createQuestionVariations(targetCount) {
        console.log('   🔄 Creating question variations...');
        let count = 0;
        
        for (const question of this.existingQuestions) {
            if (count >= targetCount) break;
            
            // Create 2-3 variations per existing question
            const variations = await this.createVariationsForQuestion(question);
            for (const variation of variations) {
                if (count >= targetCount) break;
                this.newQuestions.push(variation);
                count++;
            }
        }
        
        console.log(`      ✓ Created ${count} question variations`);
        return count;
    }

    /**
     * Create variations for a single question
     */
    async createVariationsForQuestion(originalQuestion) {
        const variations = [];
        
        if (originalQuestion.type === 'definition') {
            // Create different phrasings of the same concept
            const concept = originalQuestion.concept;
            const explanation = originalQuestion.explanation;
            
            const alternativePhrasings = [
                `What is the primary meaning of "${concept}" in social group work practice?`,
                `How would you best describe "${concept}" to a colleague?`,
                `In professional social work literature, "${concept}" is understood as:`,
                `When discussing "${concept}" with group members, what definition applies?`
            ];
            
            for (let i = 0; i < Math.min(2, alternativePhrasings.length); i++) {
                const variation = {
                    ...originalQuestion,
                    id: `${originalQuestion.id}_var${i + 1}`,
                    question: alternativePhrasings[i],
                    explanation: explanation + ` This understanding is consistent across social work practice contexts.`
                };
                variations.push(variation);
            }
        }
        
        return variations;
    }

    /**
     * Extract additional concepts from content
     */
    async extractAdditionalConcepts(targetCount) {
        console.log('   🔍 Extracting additional concepts...');
        let count = 0;
        
        for (const [key, data] of Object.entries(this.contentData)) {
            if (count >= targetCount) break;
            
            // Extract more detailed concepts
            const concepts = await this.deepExtractConcepts(data.content, key);
            
            for (const concept of concepts) {
                if (count >= targetCount) break;
                
                const question = await this.createConceptQuestion(concept, key);
                if (question) {
                    this.newQuestions.push(question);
                    count++;
                }
            }
        }
        
        console.log(`      ✓ Extracted ${count} additional concept questions`);
        return count;
    }

    /**
     * Deep extract concepts from content
     */
    async deepExtractConcepts(content, sourceFile) {
        const concepts = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Look for various patterns
            const patterns = [
                // Bullet points with descriptions
                /^• (.+): (.+)/,
                // Numbered items
                /^\d+\. (.+)/,
                // Lettered items with descriptions
                /^[a-z]\. (.+)/,
                // Statements with "is" or "are"
                /^(.+) (is|are) (.+)\./,
                // Concepts in parentheses
                /\(([^)]+)\)/g
            ];
            
            for (const pattern of patterns) {
                const matches = line.match(pattern);
                if (matches) {
                    if (pattern.source.includes('•') && matches[1] && matches[2]) {
                        // Bullet point format
                        concepts.push({
                            term: matches[1].trim(),
                            definition: matches[2].trim(),
                            source: line,
                            type: 'bullet'
                        });
                    } else if (pattern.source.includes('\\d') && matches[1]) {
                        // Numbered format
                        concepts.push({
                            term: matches[1].trim(),
                            definition: this.getFollowingContext(lines, i),
                            source: line,
                            type: 'numbered'
                        });
                    } else if (pattern.source.includes('[a-z]') && matches[1]) {
                        // Lettered format
                        concepts.push({
                            term: matches[1].trim(),
                            definition: this.getFollowingContext(lines, i),
                            source: line,
                            type: 'lettered'
                        });
                    }
                }
            }
        }
        
        // Filter out concepts we've already used
        return concepts.filter(c => 
            c.term && 
            c.term.length > 3 && 
            c.term.length < 100 &&
            !this.usedConcepts.has(c.term.toLowerCase())
        ).slice(0, 50); // Limit per file
    }

    /**
     * Get following context for a concept
     */
    getFollowingContext(lines, startIndex) {
        let context = '';
        for (let i = startIndex + 1; i < Math.min(startIndex + 3, lines.length); i++) {
            const line = lines[i].trim();
            if (line && !line.match(/^[a-z]\.|^\d+\.|^•/)) {
                context += line + ' ';
            } else {
                break;
            }
        }
        return context.trim();
    }

    /**
     * Create concept question from extracted concept
     */
    async createConceptQuestion(concept, sourceFile) {
        const term = concept.term;
        const definition = concept.definition || 'A key concept in social group work practice';
        
        if (this.usedConcepts.has(term.toLowerCase())) {
            return null;
        }
        
        this.usedConcepts.add(term.toLowerCase());
        
        const questionFormats = [
            `In social group work, what does "${term}" refer to?`,
            `How is "${term}" best understood in the context of group practice?`,
            `What is the significance of "${term}" in social work with groups?`,
            `When working with groups, how would you explain "${term}"?`
        ];
        
        const questionText = questionFormats[Math.floor(Math.random() * questionFormats.length)];
        const correctAnswer = definition.length > 150 ? definition.substring(0, 147) + '...' : definition;
        
        const distractors = this.generateContextualDistractors(term, correctAnswer);
        const options = this.shuffleOptions([correctAnswer, ...distractors.slice(0, 3)]);
        const correctIndex = options.indexOf(correctAnswer);

        return {
            id: `expanded_${this.newQuestions.length + 1}`,
            type: 'concept',
            question: questionText,
            options: {
                A: options[0],
                B: options[1],
                C: options[2],
                D: options[3]
            },
            correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
            explanation: `${term} refers to ${definition}. This concept is important for understanding effective group work practice.`,
            source: sourceFile,
            difficulty: 'medium',
            topic: this.extractTopic(term),
            concept: term
        };
    }

    /**
     * Generate contextual distractors
     */
    generateContextualDistractors(term, correctAnswer) {
        const distractors = [
            "A method primarily used in individual counseling sessions.",
            "An administrative procedure for case documentation.",
            "A supervisory technique for staff development.",
            "A research methodology for program evaluation.",
            "A policy framework for organizational management.",
            "A training approach for professional development."
        ];
        
        return distractors.filter(d => d !== correctAnswer);
    }

    /**
     * Extract topic from term
     */
    extractTopic(term) {
        const lowerTerm = term.toLowerCase();
        
        if (lowerTerm.includes('group') || lowerTerm.includes('member')) return 'Group Dynamics';
        if (lowerTerm.includes('develop') || lowerTerm.includes('stage') || lowerTerm.includes('phase')) return 'Group Development';
        if (lowerTerm.includes('process') || lowerTerm.includes('interaction')) return 'Group Process';
        if (lowerTerm.includes('structure') || lowerTerm.includes('role') || lowerTerm.includes('norm')) return 'Group Structure';
        if (lowerTerm.includes('approach') || lowerTerm.includes('model') || lowerTerm.includes('method')) return 'Practice Approaches';
        
        return 'Social Work Practice';
    }

    /**
     * Shuffle options
     */
    shuffleOptions(options) {
        const shuffled = [...options];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Create scenario variations
     */
    async createScenarioVariations(targetCount) {
        console.log('   🎭 Creating scenario variations...');
        let count = 0;
        
        // Create more detailed scenarios based on content
        const scenarioTemplates = await this.generateScenarioTemplates();
        
        for (const template of scenarioTemplates) {
            if (count >= targetCount) break;
            
            const question = await this.createScenarioFromTemplate(template);
            if (question) {
                this.newQuestions.push(question);
                count++;
            }
        }
        
        console.log(`      ✓ Created ${count} scenario variations`);
        return count;
    }

    /**
     * Generate scenario templates from content
     */
    async generateScenarioTemplates() {
        const templates = [
            {
                situation: "A social worker is facilitating a newly formed support group. Members are hesitant to share personal information and seem uncomfortable.",
                concept: "group formation",
                correctAction: "Acknowledge the discomfort as normal and facilitate introductory activities to build trust",
                distractors: [
                    "Immediately push members to share deeply personal experiences",
                    "End the session early due to lack of participation",
                    "Focus only on the most talkative member"
                ]
            },
            {
                situation: "During a task group meeting, two members have a heated disagreement about the group's direction.",
                concept: "conflict resolution",
                correctAction: "Facilitate discussion to understand different perspectives and find common ground",
                distractors: [
                    "Take sides with the member who seems more reasonable",
                    "Ignore the conflict and move to the next agenda item",
                    "Ask the disagreeing members to leave the group"
                ]
            }
        ];
        
        return templates;
    }

    /**
     * Create scenario from template
     */
    async createScenarioFromTemplate(template) {
        const options = this.shuffleOptions([template.correctAction, ...template.distractors]);
        const correctIndex = options.indexOf(template.correctAction);

        return {
            id: `scenario_exp_${this.newQuestions.length + 1}`,
            type: 'scenario',
            question: `${template.situation}\n\nWhat is the most appropriate response?`,
            options: {
                A: options[0],
                B: options[1],
                C: options[2],
                D: options[3]
            },
            correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
            explanation: `The most appropriate response is: ${template.correctAction}. This approach aligns with social work principles for ${template.concept}.`,
            source: 'Practice Scenarios',
            difficulty: 'hard',
            topic: 'Practice Application',
            concept: template.concept
        };
    }

    /**
     * Create practice questions to fill remaining slots
     */
    async createPracticeQuestions(targetCount) {
        console.log('   📝 Creating practice questions...');
        let count = 0;
        
        // Generate questions about social work principles and ethics
        const practiceAreas = [
            'group leadership',
            'member engagement',
            'group evaluation',
            'ethical considerations',
            'cultural competence'
        ];
        
        for (const area of practiceAreas) {
            if (count >= targetCount) break;
            
            const questions = await this.generatePracticeAreaQuestions(area, Math.floor(targetCount / practiceAreas.length));
            for (const question of questions) {
                if (count >= targetCount) break;
                this.newQuestions.push(question);
                count++;
            }
        }
        
        console.log(`      ✓ Created ${count} practice questions`);
        return count;
    }

    /**
     * Generate questions for specific practice area
     */
    async generatePracticeAreaQuestions(area, count) {
        const questions = [];
        
        for (let i = 0; i < count; i++) {
            const question = {
                id: `practice_${area}_${i + 1}`,
                type: 'practice',
                question: `In social group work, what is a key consideration for ${area}?`,
                options: {
                    A: `Maintaining professional boundaries while fostering ${area}`,
                    B: `Focusing solely on individual needs rather than group dynamics`,
                    C: `Avoiding any challenges that might create discomfort`,
                    D: `Prioritizing administrative requirements over client needs`
                },
                correctAnswer: 'A',
                explanation: `Effective ${area} requires balancing professional responsibilities with group needs and maintaining appropriate boundaries.`,
                source: 'Social Work Practice Principles',
                difficulty: 'medium',
                topic: 'Professional Practice',
                concept: area
            };
            
            questions.push(question);
        }
        
        return questions;
    }

    /**
     * Save expanded question set
     */
    async saveExpandedQuestions() {
        console.log('💾 Saving expanded question set...');
        
        const allQuestions = [...this.existingQuestions, ...this.newQuestions];
        
        const output = {
            metadata: {
                totalQuestions: allQuestions.length,
                originalQuestions: this.existingQuestions.length,
                newQuestions: this.newQuestions.length,
                expandedAt: new Date().toISOString(),
                questionTypes: [...new Set(allQuestions.map(q => q.type))]
            },
            questions: allQuestions
        };
        
        const outputPath = path.join(this.outputDir, 'expanded-questions.json');
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
        
        console.log(`   ✓ Saved ${allQuestions.length} total questions`);
        console.log(`   📊 Original: ${this.existingQuestions.length}, New: ${this.newQuestions.length}`);
    }
}

// Run expansion if script is executed directly
if (require.main === module) {
    const expander = new QuestionExpander();
    expander.init().catch(error => {
        console.error('💥 Fatal error during question expansion:', error);
        process.exit(1);
    });
}

module.exports = QuestionExpander;
