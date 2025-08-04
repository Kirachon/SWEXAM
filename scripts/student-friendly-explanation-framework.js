/**
 * Student-Friendly Explanation Framework
 * Structured approach for writing clear, accessible explanations that help students learn
 */

const RESEARCH_DATABASE = require('./research-database.js');

class StudentFriendlyExplanationFramework {
    constructor() {
        this.framework = {
            structure: [
                "1. State the correct answer clearly",
                "2. Explain WHY it's correct with simple reasoning", 
                "3. Explain why other options are wrong",
                "4. Provide real-world example or application",
                "5. Include authoritative source (simplified citation)"
            ],
            
            languageGuidelines: {
                avoid: [
                    "theoretical frameworks", "empirical evidence", "conceptual framework",
                    "phenomenological", "operationalization", "systematic analysis",
                    "research foundation", "methodological approach", "paradigm"
                ],
                useInstead: [
                    "research-based ideas", "proof from studies", "way of thinking about something",
                    "focusing on personal experiences", "putting ideas into action", "careful examination",
                    "studies show that", "way of doing research", "approach or model"
                ]
            },
            
            toneGuidelines: {
                conversational: "Write like you're explaining to a friend who's studying social work",
                encouraging: "Help students feel confident about learning",
                clear: "Use short sentences and simple words when possible",
                practical: "Connect concepts to real social work situations"
            }
        };
    }

    simplifyLanguage(text) {
        let simplified = text;
        
        // Replace technical terms with plain language
        const replacements = {
            "theoretical frameworks": "research-based ideas",
            "empirical evidence": "proof from studies", 
            "conceptual framework": "way of thinking about something",
            "research foundation": "studies show that",
            "mediating function": "helping people work together",
            "symbiotic relationship": "when two things help each other",
            "phenomenological": "focusing on personal experiences",
            "operationalization": "putting ideas into action",
            "systematic analysis": "careful, step-by-step examination",
            "methodological approach": "way of doing research",
            "paradigm": "approach or model"
        };
        
        Object.entries(replacements).forEach(([technical, simple]) => {
            const regex = new RegExp(technical, 'gi');
            simplified = simplified.replace(regex, simple);
        });
        
        return simplified;
    }

    createExplanation(question, correctAnswer, topic) {
        const questionText = question.question.toLowerCase();
        const correctOption = question.options[correctAnswer];
        
        // Step 1: State correct answer clearly
        let explanation = `**Correct Answer: ${correctAnswer}** - ${correctOption}\n\n`;
        
        // Step 2: Explain WHY it's correct
        explanation += `**Why this is correct:** `;
        explanation += this.getReasoningForTopic(questionText, correctOption, topic);
        explanation += `\n\n`;
        
        // Step 3: Explain why other options are wrong
        explanation += `**Why the other options are wrong:**\n`;
        Object.entries(question.options).forEach(([key, value]) => {
            if (key !== correctAnswer) {
                explanation += `• **${key}** (${value}) - `;
                explanation += this.getWrongAnswerExplanation(key, value, questionText, topic);
                explanation += `\n`;
            }
        });
        explanation += `\n`;
        
        // Step 4: Real-world example
        const example = this.getRealWorldExample(questionText, topic);
        if (example) {
            explanation += `**Real-world example:** ${example}\n\n`;
        }
        
        // Step 5: Simplified citation
        const citation = this.getSimplifiedCitation(topic, questionText);
        explanation += `**Source:** ${citation}`;
        
        return explanation;
    }

    getReasoningForTopic(questionText, correctOption, topic) {
        // Check for mutual aid first, regardless of topic classification
        if (questionText.includes('mutual aid') || questionText.includes('schwartz')) {
            return "William Schwartz discovered that people in groups can help each other solve problems better than a worker helping each person individually. It's like having a team where everyone contributes their strengths.";
        }

        // Group Development reasoning
        if (topic === 'Group Development') {
            if (questionText.includes('except') && questionText.includes('tuckman')) {
                return "Bruce Tuckman identified five specific stages that groups go through: forming, storming, norming, performing, and adjourning. Any other term is not part of his original model.";
            }
            if (questionText.includes('tuckman') || questionText.includes('forming') ||
                questionText.includes('storming') || questionText.includes('norming')) {
                return "Bruce Tuckman's research shows that all groups go through predictable stages as they develop, just like how people grow from childhood to adulthood. This helps social workers know what to expect and how to help groups succeed.";
            }
            if (questionText.includes('natural group') || questionText.includes('formed group')) {
                return "Understanding the difference between groups that form naturally (like friends) versus groups that are created by someone else (like therapy groups) helps social workers use the right approach for each type.";
            }
            return "Groups develop in predictable ways, and knowing these patterns helps social workers guide groups more effectively.";
        }
        
        // Practice Models reasoning (also check question text for mutual aid regardless of topic)
        if (topic === 'Practice Models' || questionText.includes('mutual aid') || questionText.includes('schwartz')) {
            if (questionText.includes('mutual aid') || questionText.includes('schwartz')) {
                return "William Schwartz discovered that people in groups can help each other solve problems better than a worker helping each person individually. It's like having a team where everyone contributes their strengths.";
            }
            if (questionText.includes('developmental')) {
                return "This approach sees groups as places where people can practice social skills and grow, like a safe practice space before facing real-world challenges.";
            }
            if (questionText.includes('remedial')) {
                return "This approach focuses on changing specific problem behaviors through group influence, similar to how group therapy works to address particular issues.";
            }
            return "Different group work approaches are like different tools - each one works best for specific situations and goals.";
        }
        
        // Professional Ethics reasoning
        if (topic === 'Professional Ethics') {
            if (questionText.includes('confidentiality')) {
                return "In groups, keeping information private is more complicated because multiple people hear it, not just the social worker. Everyone needs to agree on the rules to protect each other's privacy.";
            }
            if (questionText.includes('boundaries')) {
                return "Professional boundaries are like invisible fences that keep the helping relationship safe and focused. They protect both the social worker and group members.";
            }
            return "Professional ethics provide guidelines to ensure that social workers help people in ways that are safe, fair, and effective.";
        }
        
        // Group Dynamics reasoning
        if (topic === 'Group Dynamics') {
            if (questionText.includes('cohesion')) {
                return "Group cohesion is like team spirit - when people feel connected to the group, they participate more and help each other succeed.";
            }
            if (questionText.includes('norms')) {
                return "Group norms are unwritten rules about behavior, like how families have their own ways of doing things. They help groups function smoothly.";
            }
            return "Understanding how groups work helps social workers create positive environments where people can help each other.";
        }
        
        // Default reasoning
        return "This concept is important for effective social work practice because it helps workers understand how to work with groups successfully.";
    }

    getWrongAnswerExplanation(optionKey, optionText, questionText, topic) {
        // More specific wrong answer explanations based on context
        const lowerOptionText = optionText.toLowerCase();
        const lowerQuestionText = questionText.toLowerCase();

        // Handle "EXCEPT" questions differently
        if (lowerQuestionText.includes('except') || lowerQuestionText.includes('not')) {
            if (lowerQuestionText.includes('tuckman') && topic === 'Group Development') {
                if (lowerOptionText.includes('forming')) {
                    return "This IS one of Tuckman's stages - the first stage where members get acquainted.";
                }
                if (lowerOptionText.includes('storming')) {
                    return "This IS one of Tuckman's stages - when conflicts and disagreements emerge.";
                }
                if (lowerOptionText.includes('norming')) {
                    return "This IS one of Tuckman's stages - when the group establishes rules and procedures.";
                }
                if (lowerOptionText.includes('performing')) {
                    return "This IS one of Tuckman's stages - when the group works effectively toward goals.";
                }
                if (lowerOptionText.includes('adjourning')) {
                    return "This IS one of Tuckman's stages - when the group ends and members say goodbye.";
                }
            }
        }

        // Tuckman stages - specific wrong explanations for regular questions
        if (lowerQuestionText.includes('forming') && topic === 'Group Development') {
            if (lowerOptionText.includes('conflict') || lowerOptionText.includes('competition')) {
                return "This describes the 'storming' stage, which comes after forming when conflicts emerge.";
            }
            if (lowerOptionText.includes('accomplish') || lowerOptionText.includes('effective')) {
                return "This describes the 'performing' stage, which happens much later when the group is working well together.";
            }
            if (lowerOptionText.includes('termination') || lowerOptionText.includes('ending')) {
                return "This describes the 'adjourning' stage, which is the final stage when groups end.";
            }
        }

        if (lowerQuestionText.includes('storming') && topic === 'Group Development') {
            if (lowerOptionText.includes('polite') || lowerOptionText.includes('cautious')) {
                return "This describes the 'forming' stage, which happens before conflicts emerge.";
            }
            if (lowerOptionText.includes('accomplish') || lowerOptionText.includes('effective')) {
                return "This describes the 'performing' stage, which comes after conflicts are resolved.";
            }
        }

        // General contextual explanations
        if (lowerOptionText.includes('individual') && topic === 'Group Development') {
            return "This focuses on individuals rather than understanding how the whole group develops and changes.";
        }

        if (lowerOptionText.includes('control') && topic === 'Professional Ethics') {
            return "This suggests the worker has too much control, which goes against social work values of client self-determination.";
        }

        if (lowerOptionText.includes('ignore') || lowerOptionText.includes('avoid')) {
            return "Ignoring or avoiding issues is not an effective social work approach - problems need to be addressed directly.";
        }

        if (lowerOptionText.includes('random') || lowerOptionText.includes('unplanned') && !lowerQuestionText.includes('natural')) {
            return "This misunderstands the purposeful nature of social work groups, which are intentionally designed to help people.";
        }

        // Mutual aid specific explanations
        if (lowerQuestionText.includes('mutual aid')) {
            if (lowerOptionText.includes('financial') || lowerOptionText.includes('money')) {
                return "Mutual aid in social work isn't about money - it's about people supporting each other emotionally and socially.";
            }
            if (lowerOptionText.includes('professional') && lowerOptionText.includes('only')) {
                return "This misses the key point of mutual aid - that group members help each other, not just the professional helping everyone.";
            }
            if (lowerOptionText.includes('agency')) {
                return "Mutual aid happens between group members themselves, not from the agency providing support.";
            }
        }

        // Default explanations based on topic
        const topicDefaults = {
            'Group Development': "This doesn't match what research tells us about how groups naturally develop over time.",
            'Practice Models': "This approach wouldn't be effective in real social work practice with groups.",
            'Professional Ethics': "This goes against professional social work standards and ethical guidelines.",
            'Group Dynamics': "This misunderstands how group interactions and relationships actually work.",
            'Group Structure': "This doesn't reflect how successful groups organize themselves and their activities.",
            'Professional Practice': "This approach would likely create problems rather than help people effectively."
        };

        return topicDefaults[topic] || "This doesn't align with established social work principles and research.";
    }

    getRealWorldExample(questionText, topic) {
        if (topic === 'Group Development') {
            if (questionText.includes('forming')) {
                return "In a new support group for people dealing with grief, members might be quiet and polite at first, unsure about sharing personal feelings with strangers.";
            }
            if (questionText.includes('storming')) {
                return "In a teen anger management group, members might challenge the leader's rules or argue about how the group should be run.";
            }
            if (questionText.includes('norming')) {
                return "A parenting skills group develops an unspoken rule that everyone gets to share before anyone speaks twice, creating fairness.";
            }
        }
        
        if (topic === 'Practice Models') {
            if (questionText.includes('mutual aid')) {
                return "In a job search group, members share job leads with each other, practice interviews together, and offer encouragement during tough times.";
            }
        }
        
        if (topic === 'Professional Ethics') {
            if (questionText.includes('confidentiality')) {
                return "In a domestic violence support group, members agree that personal stories shared in the group won't be discussed outside, even with family members.";
            }
        }
        
        return null; // No example needed for every question
    }

    getSimplifiedCitation(topic, questionText) {
        if (questionText.includes('tuckman')) {
            return "Based on Bruce Tuckman's research on group development (1965)";
        }
        if (questionText.includes('schwartz') || questionText.includes('mutual aid')) {
            return "Based on William Schwartz's mutual aid model (1961)";
        }
        if (questionText.includes('confidentiality') || questionText.includes('ethics')) {
            return "Based on NASW Code of Ethics (2021)";
        }
        if (topic === 'Group Dynamics') {
            return "Based on Toseland & Rivas group work principles (2017)";
        }
        
        return "Based on established social work research and practice standards";
    }

    generateSampleExplanation() {
        console.log("📝 SAMPLE STUDENT-FRIENDLY EXPLANATION\n");
        
        const sampleQuestion = {
            question: "According to Tuckman's model, the 'forming' stage of group development is characterized by:",
            options: {
                A: "High conflict and competition among members",
                B: "Polite, cautious behavior as members get acquainted", 
                C: "Effective task accomplishment and goal achievement",
                D: "Preparation for group termination and ending"
            },
            correctAnswer: "B",
            topic: "Group Development"
        };
        
        const explanation = this.createExplanation(sampleQuestion, "B", "Group Development");
        
        console.log("QUESTION:", sampleQuestion.question);
        console.log("\nENHANCED EXPLANATION:");
        console.log(explanation);
        
        console.log("\n" + "=".repeat(80));
        console.log("✅ This explanation follows the framework:");
        console.log("1. ✅ States correct answer clearly");
        console.log("2. ✅ Explains WHY with simple reasoning");
        console.log("3. ✅ Explains why other options are wrong");
        console.log("4. ✅ Provides real-world example");
        console.log("5. ✅ Includes simplified citation");
        console.log("6. ✅ Uses plain, accessible language");
        console.log("7. ✅ Helps students understand the concept");
    }
}

if (require.main === module) {
    const framework = new StudentFriendlyExplanationFramework();
    framework.generateSampleExplanation();
}

module.exports = StudentFriendlyExplanationFramework;
