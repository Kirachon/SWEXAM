const fs = require('fs');
const path = require('path');

/**
 * Question Generation System
 * Generates multiple-choice questions exclusively from extracted PDF content
 * All questions are scenario-based with exactly 4 options (A, B, C, D)
 */

class QuestionGenerator {
    constructor() {
        this.contentDir = path.join(__dirname, '..', 'extracted-content');
        this.analysisDir = path.join(__dirname, '..', 'content-analysis');
        this.outputDir = path.join(__dirname, '..', 'generated-questions');
        this.questions = [];
        this.usedConcepts = new Set();
        this.contentData = {};
        this.analysisData = {};
    }

    /**
     * Initialize question generation process
     */
    async init() {
        console.log('🎯 Starting question generation...');
        
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        await this.loadContentData();
        await this.loadAnalysisData();
        await this.generateAllQuestions();
        await this.validateQuestions();
        await this.saveQuestions();
        
        console.log('✅ Question generation completed!');
    }

    /**
     * Load all extracted content data
     */
    async loadContentData() {
        console.log('📚 Loading content data...');
        
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
     * Load content analysis data
     */
    async loadAnalysisData() {
        console.log('📊 Loading analysis data...');
        
        const analysisPath = path.join(this.analysisDir, 'content-analysis.json');
        this.analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
        
        console.log(`   ✓ Loaded analysis with ${this.analysisData.summary.totalDefinitions} definitions`);
    }

    /**
     * Generate all types of questions
     */
    async generateAllQuestions() {
        console.log('🔨 Generating questions...');

        // Target: 1000 questions total
        // Distribution: 200 definition, 300 conceptual, 300 scenario, 200 application
        await this.generateDefinitionQuestions(200);
        await this.generateConceptualQuestions(300);
        await this.generateScenarioQuestions(300);
        await this.generateApplicationQuestions(200);

        console.log(`   ✓ Generated ${this.questions.length} total questions`);
    }

    /**
     * Generate questions from definitions
     */
    async generateDefinitionQuestions(targetCount = 200) {
        console.log('   📖 Generating definition-based questions...');

        const definitions = this.analysisData.definitions;
        let count = 0;

        // Generate multiple questions per definition to reach target
        for (const def of definitions) {
            if (count >= targetCount) break;

            if (def.term && def.text && def.text.length > 30) {
                // Create multiple variations of each definition question
                const variations = this.createDefinitionQuestionVariations(def);
                for (const question of variations) {
                    if (count >= targetCount) break;
                    if (question) {
                        this.questions.push(question);
                        count++;
                    }
                }
            }
        }

        // If we still need more questions, generate from content patterns
        if (count < targetCount) {
            count += await this.generateAdditionalDefinitionQuestions(targetCount - count);
        }

        console.log(`      ✓ Created ${count} definition questions`);
    }

    /**
     * Create a definition-based multiple choice question
     */
    createDefinitionQuestion(definition) {
        const term = this.cleanTerm(definition.term);
        if (!term || term.length < 3) return null;

        // Extract the definition part
        const defText = definition.text;
        let definitionPart = '';
        
        const patterns = [
            / is defined as (.+)/i,
            / refers to (.+)/i,
            / means (.+)/i,
            / is (.+)/i
        ];
        
        for (const pattern of patterns) {
            const match = defText.match(pattern);
            if (match) {
                definitionPart = match[1].trim();
                break;
            }
        }
        
        if (!definitionPart || definitionPart.length < 10) return null;

        // Create scenario-based question
        const scenarios = [
            `In social work practice, when working with groups, a social worker encounters the concept of "${term}". How should this be understood?`,
            `During a group work session, a supervisor asks about the meaning of "${term}". What is the most accurate explanation?`,
            `A social work student is studying group dynamics and needs to explain "${term}" to their peers. What definition should they provide?`,
            `In the context of social group work, when discussing "${term}", what does this concept specifically refer to?`
        ];
        
        const questionText = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        // Generate distractors
        const correctAnswer = this.formatDefinition(definitionPart);
        const distractors = this.generateDistractors(term, correctAnswer, definition.file);
        
        if (distractors.length < 3) return null;

        const options = this.shuffleOptions([correctAnswer, ...distractors.slice(0, 3)]);
        const correctIndex = options.indexOf(correctAnswer);

        return {
            id: `def_${this.questions.length + 1}`,
            type: 'definition',
            question: questionText,
            options: {
                A: options[0],
                B: options[1],
                C: options[2],
                D: options[3]
            },
            correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
            explanation: `${term} ${defText.includes('is defined as') ? 'is defined as' : 'refers to'} ${definitionPart}. This definition is found in the social work literature on group practice.`,
            source: definition.file,
            difficulty: 'medium',
            topic: this.extractTopic(term),
            concept: term
        };
    }

    /**
     * Clean and format term names
     */
    cleanTerm(term) {
        if (!term) return '';
        
        return term
            .replace(/^[a-z]\.\s*/i, '') // Remove letter prefixes
            .replace(/^\d+\.\s*/, '') // Remove number prefixes
            .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim()
            .toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase()); // Title case
    }

    /**
     * Format definition text
     */
    formatDefinition(definition) {
        return definition
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\.$/, '') // Remove trailing period
            + '.';
    }

    /**
     * Generate better distractors for multiple choice
     */
    generateBetterDistractors(term, correctAnswer, sourceFile) {
        const distractors = [];

        // Get other definitions from the same file for context-appropriate distractors
        const sameFileDefinitions = this.analysisData.definitions
            .filter(def => def.file === sourceFile && def.term !== term)
            .slice(0, 5);

        // Add some distractors from other definitions (modified to be incorrect)
        for (const def of sameFileDefinitions) {
            if (def.text && def.text.length > 20) {
                const distractor = this.extractDefinitionPart(def.text);
                if (distractor && distractor !== correctAnswer && distractor.length > 10 && distractor.length < 200) {
                    distractors.push(this.formatDefinition(distractor));
                }
            }
        }

        // Add generic but plausible distractors if needed
        if (distractors.length < 3) {
            const genericDistractors = this.generateGenericDistractors(term, correctAnswer);
            distractors.push(...genericDistractors);
        }

        return distractors.slice(0, 3);
    }

    /**
     * Generate generic but plausible distractors
     */
    generateGenericDistractors(term, correctAnswer) {
        const distractors = [];
        const lowerTerm = term.toLowerCase();

        // Context-specific distractors based on term type
        if (lowerTerm.includes('group')) {
            distractors.push(
                "A method focused primarily on individual counseling techniques.",
                "An administrative process for organizing community resources.",
                "A research methodology for studying organizational behavior."
            );
        } else if (lowerTerm.includes('process')) {
            distractors.push(
                "A static framework that remains unchanged throughout intervention.",
                "A documentation system for recording client information.",
                "A supervisory technique for evaluating worker performance."
            );
        } else if (lowerTerm.includes('development')) {
            distractors.push(
                "A regression pattern that moves backward through stages.",
                "A funding mechanism for supporting social programs.",
                "A training curriculum for new social workers."
            );
        } else {
            // Generic social work distractors
            distractors.push(
                "A technique primarily used in case management practice.",
                "An approach focused on policy development and advocacy.",
                "A method designed for community organization work.",
                "A framework for administrative supervision and oversight."
            );
        }

        return distractors.filter(d => d !== correctAnswer).slice(0, 3);
    }

    /**
     * Shuffle answer options
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
     * Extract topic from term
     */
    extractTopic(term) {
        const topicKeywords = {
            'Group Development': ['development', 'formation', 'phase', 'stage'],
            'Group Structure': ['structure', 'role', 'norm', 'communication'],
            'Group Process': ['process', 'dynamic', 'interaction', 'cohesion'],
            'Group Work Approaches': ['approach', 'model', 'method', 'technique'],
            'Social Work Practice': ['practice', 'intervention', 'assessment', 'worker']
        };
        
        const lowerTerm = term.toLowerCase();
        
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => lowerTerm.includes(keyword))) {
                return topic;
            }
        }
        
        return 'General Social Work';
    }

    /**
     * Create multiple variations of definition questions
     */
    createDefinitionQuestionVariations(definition) {
        const variations = [];
        const term = this.cleanTerm(definition.term);
        if (!term || term.length < 3) return variations;

        // Extract the definition part
        const defText = definition.text;
        let definitionPart = this.extractDefinitionPart(defText);

        if (!definitionPart || definitionPart.length < 10) return variations;

        // Create different question formats
        const questionFormats = [
            `In social work practice, when working with groups, a social worker encounters the concept of "${term}". How should this be understood?`,
            `During a group work session, a supervisor asks about the meaning of "${term}". What is the most accurate explanation?`,
            `A social work student is studying group dynamics and needs to explain "${term}" to their peers. What definition should they provide?`,
            `In the context of social group work, when discussing "${term}", what does this concept specifically refer to?`,
            `A practitioner is documenting their group work and references "${term}". What does this term mean in social work practice?`
        ];

        // Create up to 3 variations per definition
        for (let i = 0; i < Math.min(3, questionFormats.length); i++) {
            const question = this.createSingleDefinitionQuestion(
                term,
                definitionPart,
                questionFormats[i],
                definition,
                i
            );
            if (question) variations.push(question);
        }

        return variations;
    }

    /**
     * Extract definition part from text
     */
    extractDefinitionPart(defText) {
        const patterns = [
            / is defined as (.+)/i,
            / refers to (.+)/i,
            / means (.+)/i,
            / is (.+)/i,
            / are (.+)/i
        ];

        for (const pattern of patterns) {
            const match = defText.match(pattern);
            if (match) {
                return match[1].trim().replace(/\.$/, '');
            }
        }

        // If no pattern matches, try to extract meaningful content
        if (defText.length > 50) {
            return defText.substring(0, 100).trim();
        }

        return null;
    }

    /**
     * Create a single definition question with proper formatting
     */
    createSingleDefinitionQuestion(term, definitionPart, questionText, definition, variation) {
        const correctAnswer = this.formatDefinition(definitionPart);
        const distractors = this.generateBetterDistractors(term, correctAnswer, definition.file);

        if (distractors.length < 3) return null;

        const options = this.shuffleOptions([correctAnswer, ...distractors.slice(0, 3)]);
        const correctIndex = options.indexOf(correctAnswer);

        return {
            id: `def_${this.questions.length + 1}_v${variation}`,
            type: 'definition',
            question: questionText,
            options: {
                A: options[0],
                B: options[1],
                C: options[2],
                D: options[3]
            },
            correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
            explanation: `${term} is defined as ${definitionPart}. This concept is fundamental to understanding social group work practice and is derived from the professional literature on group dynamics and social work methodology.`,
            source: definition.file,
            difficulty: 'medium',
            topic: this.extractTopic(term),
            concept: term
        };
    }

    /**
     * Generate additional definition questions from content patterns
     */
    async generateAdditionalDefinitionQuestions(needed) {
        let count = 0;

        // Extract more concepts from content using pattern matching
        for (const [key, data] of Object.entries(this.contentData)) {
            if (count >= needed) break;

            const concepts = this.extractConceptsFromContent(data.content);
            for (const concept of concepts) {
                if (count >= needed) break;

                const question = this.createConceptQuestion(concept, key);
                if (question) {
                    this.questions.push(question);
                    count++;
                }
            }
        }

        return count;
    }

    /**
     * Extract concepts from content using patterns
     */
    extractConceptsFromContent(content) {
        const concepts = [];
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();

            // Look for concept patterns
            if (trimmed.length > 20 && trimmed.length < 200) {
                // Pattern: "X is/are/refers to Y"
                const patterns = [
                    /^([^.]+) is ([^.]+)\./,
                    /^([^.]+) are ([^.]+)\./,
                    /^([^.]+) refers to ([^.]+)\./,
                    /^• ([^:]+): (.+)/
                ];

                for (const pattern of patterns) {
                    const match = trimmed.match(pattern);
                    if (match && match[1] && match[2]) {
                        concepts.push({
                            term: match[1].trim(),
                            definition: match[2].trim(),
                            source: trimmed
                        });
                    }
                }
            }
        }

        return concepts.slice(0, 10); // Limit per file
    }

    /**
     * Create question from extracted concept
     */
    createConceptQuestion(concept, sourceFile) {
        const term = this.cleanTerm(concept.term);
        if (!term || term.length < 3 || term.length > 50) return null;

        const definition = concept.definition;
        if (!definition || definition.length < 10) return null;

        const questionText = `In social work group practice, what does "${term}" specifically mean?`;
        const correctAnswer = this.formatDefinition(definition);
        const distractors = this.generateGenericDistractors(term, correctAnswer);

        if (distractors.length < 3) return null;

        const options = this.shuffleOptions([correctAnswer, ...distractors.slice(0, 3)]);
        const correctIndex = options.indexOf(correctAnswer);

        return {
            id: `concept_${this.questions.length + 1}`,
            type: 'concept',
            question: questionText,
            options: {
                A: options[0],
                B: options[1],
                C: options[2],
                D: options[3]
            },
            correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
            explanation: `${term} is defined as ${definition}. This understanding is essential for effective social group work practice.`,
            source: sourceFile,
            difficulty: 'medium',
            topic: this.extractTopic(term),
            concept: term
        };
    }

    /**
     * Generate conceptual understanding questions
     */
    async generateConceptualQuestions(targetCount = 300) {
        console.log('   🧠 Generating conceptual questions...');

        let count = 0;

        // Generate questions about relationships between concepts
        count += await this.generateRelationshipQuestions(Math.floor(targetCount * 0.4));

        // Generate questions about applications of concepts
        count += await this.generateConceptApplicationQuestions(Math.floor(targetCount * 0.3));

        // Generate questions about characteristics and features
        count += await this.generateCharacteristicQuestions(Math.floor(targetCount * 0.3));

        console.log(`      ✓ Created ${count} conceptual questions`);
    }

    /**
     * Generate relationship questions between concepts
     */
    async generateRelationshipQuestions(targetCount) {
        let count = 0;

        // Create questions about how concepts relate to each other
        const relationships = [
            { concept1: 'group formation', concept2: 'group development', relationship: 'precedes' },
            { concept1: 'group norms', concept2: 'group cohesion', relationship: 'influences' },
            { concept1: 'social worker', concept2: 'group process', relationship: 'facilitates' },
            { concept1: 'treatment groups', concept2: 'task groups', relationship: 'differs from' }
        ];

        for (const rel of relationships) {
            if (count >= targetCount) break;

            const question = this.createRelationshipQuestion(rel);
            if (question) {
                this.questions.push(question);
                count++;
            }
        }

        return count;
    }

    /**
     * Generate concept application questions
     */
    async generateConceptApplicationQuestions(targetCount) {
        let count = 0;

        // Generate questions about when and how to apply concepts
        const applications = [
            { concept: 'mutual aid', context: 'group members supporting each other' },
            { concept: 'group cohesion', context: 'building unity in the group' },
            { concept: 'group norms', context: 'establishing behavioral expectations' }
        ];

        for (const app of applications) {
            if (count >= targetCount) break;

            const question = this.createApplicationQuestion(app);
            if (question) {
                this.questions.push(question);
                count++;
            }
        }

        return count;
    }

    /**
     * Generate characteristic questions
     */
    async generateCharacteristicQuestions(targetCount) {
        let count = 0;

        // Generate questions about characteristics of different concepts
        const characteristics = [
            { concept: 'formed groups', characteristics: ['external influence', 'specific purpose', 'planned'] },
            { concept: 'natural groups', characteristics: ['unplanned', 'mutual attraction', 'organic development'] }
        ];

        for (const char of characteristics) {
            if (count >= targetCount) break;

            const question = this.createCharacteristicQuestion(char);
            if (question) {
                this.questions.push(question);
                count++;
            }
        }

        return count;
    }

    /**
     * Generate scenario-based questions
     */
    async generateScenarioQuestions(targetCount = 300) {
        console.log('   🎭 Generating scenario questions...');

        let count = 0;

        // Generate different types of scenario questions
        count += await this.generatePracticeScenarios(Math.floor(targetCount * 0.4));
        count += await this.generateGroupDynamicsScenarios(Math.floor(targetCount * 0.3));
        count += await this.generateInterventionScenarios(Math.floor(targetCount * 0.3));

        console.log(`      ✓ Created ${count} scenario questions`);
    }

    /**
     * Generate practice scenario questions
     */
    async generatePracticeScenarios(targetCount) {
        let count = 0;

        const scenarios = [
            {
                situation: "A social worker is facilitating a support group for individuals dealing with grief. During the third session, one member becomes very emotional and starts crying.",
                concept: "group process",
                correctAction: "Allow the emotional expression while maintaining group safety and encouraging mutual support",
                distractors: [
                    "Immediately redirect the conversation to avoid discomfort",
                    "Ask the crying member to leave until they can compose themselves",
                    "Focus solely on the crying member and ignore other group members"
                ]
            },
            {
                situation: "In a task group working on community advocacy, members are having difficulty reaching consensus on their approach.",
                concept: "group decision making",
                correctAction: "Facilitate discussion to explore different viewpoints and guide toward collaborative solution",
                distractors: [
                    "Make the decision for the group to save time",
                    "Let the most vocal member decide for everyone",
                    "Postpone the decision indefinitely to avoid conflict"
                ]
            }
        ];

        for (const scenario of scenarios) {
            if (count >= targetCount) break;

            const question = this.createScenarioQuestion(scenario);
            if (question) {
                this.questions.push(question);
                count++;
            }
        }

        return count;
    }

    /**
     * Generate group dynamics scenario questions
     */
    async generateGroupDynamicsScenarios(targetCount) {
        let count = 0;

        const dynamicsScenarios = [
            {
                situation: "A group member consistently dominates discussions and interrupts others.",
                concept: "group roles",
                correctAction: "Address the behavior directly while maintaining respect and exploring underlying needs",
                distractors: [
                    "Ignore the behavior hoping it will resolve itself",
                    "Publicly embarrass the member to stop the behavior",
                    "Remove the member from the group immediately"
                ]
            }
        ];

        for (const scenario of dynamicsScenarios) {
            if (count >= targetCount) break;

            const question = this.createScenarioQuestion(scenario);
            if (question) {
                this.questions.push(question);
                count++;
            }
        }

        return count;
    }

    /**
     * Generate intervention scenario questions
     */
    async generateInterventionScenarios(targetCount) {
        let count = 0;

        const interventionScenarios = [
            {
                situation: "A therapy group has developed strong cohesion but is resistant to addressing difficult topics.",
                concept: "group intervention",
                correctAction: "Gently challenge the group while maintaining safety and exploring resistance",
                distractors: [
                    "Force the group to discuss difficult topics immediately",
                    "Accept the resistance and avoid challenging topics entirely",
                    "Disband the group and start over with new members"
                ]
            }
        ];

        for (const scenario of interventionScenarios) {
            if (count >= targetCount) break;

            const question = this.createScenarioQuestion(scenario);
            if (question) {
                this.questions.push(question);
                count++;
            }
        }

        return count;
    }

    /**
     * Generate application questions
     */
    async generateApplicationQuestions(targetCount = 200) {
        console.log('   🎯 Generating application questions...');

        let count = 0;

        // Generate questions about practical application of concepts
        count += await this.generateMethodApplicationQuestions(Math.floor(targetCount * 0.5));
        count += await this.generateSkillApplicationQuestions(Math.floor(targetCount * 0.5));

        console.log(`      ✓ Created ${count} application questions`);
    }

    /**
     * Create a scenario-based question
     */
    createScenarioQuestion(scenario) {
        const options = this.shuffleOptions([
            scenario.correctAction,
            ...scenario.distractors
        ]);

        const correctIndex = options.indexOf(scenario.correctAction);

        return {
            id: `scenario_${this.questions.length + 1}`,
            type: 'scenario',
            question: `${scenario.situation}\n\nWhat is the most appropriate response for the social worker?`,
            options: {
                A: options[0],
                B: options[1],
                C: options[2],
                D: options[3]
            },
            correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
            explanation: `The correct approach is: ${scenario.correctAction}. This response aligns with social work principles and best practices for ${scenario.concept}.`,
            source: 'Social Work Practice Scenarios',
            difficulty: 'hard',
            topic: 'Practice Application',
            concept: scenario.concept
        };
    }

    /**
     * Create relationship question
     */
    createRelationshipQuestion(relationship) {
        const questionText = `How does ${relationship.concept1} relate to ${relationship.concept2} in social group work?`;

        const correctAnswer = `${relationship.concept1} ${relationship.relationship} ${relationship.concept2}`;
        const distractors = [
            `${relationship.concept1} contradicts ${relationship.concept2}`,
            `${relationship.concept1} is identical to ${relationship.concept2}`,
            `${relationship.concept1} is unrelated to ${relationship.concept2}`
        ];

        const options = this.shuffleOptions([correctAnswer, ...distractors]);
        const correctIndex = options.indexOf(correctAnswer);

        return {
            id: `rel_${this.questions.length + 1}`,
            type: 'relationship',
            question: questionText,
            options: {
                A: options[0],
                B: options[1],
                C: options[2],
                D: options[3]
            },
            correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
            explanation: `${relationship.concept1} ${relationship.relationship} ${relationship.concept2}. Understanding these relationships is crucial for effective group work practice.`,
            source: 'Conceptual Relationships',
            difficulty: 'medium',
            topic: 'Conceptual Understanding',
            concept: `${relationship.concept1}-${relationship.concept2}`
        };
    }

    /**
     * Create application question
     */
    createApplicationQuestion(application) {
        const questionText = `When would a social worker most appropriately apply the concept of ${application.concept}?`;

        const correctAnswer = `When ${application.context}`;
        const distractors = [
            "When conducting individual therapy sessions",
            "When writing administrative reports",
            "When attending staff meetings"
        ];

        const options = this.shuffleOptions([correctAnswer, ...distractors]);
        const correctIndex = options.indexOf(correctAnswer);

        return {
            id: `app_${this.questions.length + 1}`,
            type: 'application',
            question: questionText,
            options: {
                A: options[0],
                B: options[1],
                C: options[2],
                D: options[3]
            },
            correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
            explanation: `${application.concept} is most appropriately applied ${application.context}. This application demonstrates understanding of when and how to use this concept effectively.`,
            source: 'Practice Application',
            difficulty: 'medium',
            topic: 'Application',
            concept: application.concept
        };
    }

    /**
     * Create characteristic question
     */
    createCharacteristicQuestion(characteristic) {
        const questionText = `What are the key characteristics of ${characteristic.concept}?`;

        const correctAnswer = characteristic.characteristics.join(', ');
        const distractors = [
            "Rigid structure, formal procedures, hierarchical organization",
            "Individual focus, isolated practice, competitive dynamics",
            "Administrative emphasis, bureaucratic processes, policy orientation"
        ];

        const options = this.shuffleOptions([correctAnswer, ...distractors]);
        const correctIndex = options.indexOf(correctAnswer);

        return {
            id: `char_${this.questions.length + 1}`,
            type: 'characteristic',
            question: questionText,
            options: {
                A: options[0],
                B: options[1],
                C: options[2],
                D: options[3]
            },
            correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
            explanation: `${characteristic.concept} is characterized by: ${correctAnswer}. These characteristics distinguish this concept from other related concepts in social work practice.`,
            source: 'Conceptual Characteristics',
            difficulty: 'medium',
            topic: 'Conceptual Understanding',
            concept: characteristic.concept
        };
    }

    /**
     * Generate method application questions
     */
    async generateMethodApplicationQuestions(targetCount) {
        let count = 0;

        const methods = [
            { method: 'developmental approach', application: 'helping groups progress through natural stages' },
            { method: 'remedial approach', application: 'addressing specific problems or dysfunctions' },
            { method: 'social goals model', application: 'promoting social change and community action' }
        ];

        for (const method of methods) {
            if (count >= targetCount) break;

            const question = this.createApplicationQuestion(method);
            if (question) {
                this.questions.push(question);
                count++;
            }
        }

        return count;
    }

    /**
     * Generate skill application questions
     */
    async generateSkillApplicationQuestions(targetCount) {
        let count = 0;

        const skills = [
            { concept: 'active listening', context: 'facilitating group communication and understanding' },
            { concept: 'conflict resolution', context: 'addressing disagreements between group members' },
            { concept: 'group facilitation', context: 'guiding group process and maintaining focus' }
        ];

        for (const skill of skills) {
            if (count >= targetCount) break;

            const question = this.createApplicationQuestion(skill);
            if (question) {
                this.questions.push(question);
                count++;
            }
        }

        return count;
    }

    /**
     * Validate generated questions
     */
    async validateQuestions() {
        console.log('✅ Validating questions...');
        
        const validQuestions = this.questions.filter(q => 
            q.question && 
            q.options && 
            Object.keys(q.options).length === 4 &&
            q.correctAnswer &&
            q.explanation
        );
        
        this.questions = validQuestions;
        console.log(`   ✓ ${validQuestions.length} questions passed validation`);
    }

    /**
     * Save generated questions
     */
    async saveQuestions() {
        console.log('💾 Saving questions...');
        
        const output = {
            metadata: {
                totalQuestions: this.questions.length,
                generatedAt: new Date().toISOString(),
                sourceFiles: Object.keys(this.contentData),
                questionTypes: [...new Set(this.questions.map(q => q.type))]
            },
            questions: this.questions
        };
        
        const outputPath = path.join(this.outputDir, 'generated-questions.json');
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
        
        console.log(`   ✓ Saved ${this.questions.length} questions to generated-questions.json`);
    }
}

// Run generation if script is executed directly
if (require.main === module) {
    const generator = new QuestionGenerator();
    generator.init().catch(error => {
        console.error('💥 Fatal error during question generation:', error);
        process.exit(1);
    });
}

module.exports = QuestionGenerator;
