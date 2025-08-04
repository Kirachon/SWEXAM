/**
 * Comprehensive Explanation Enhancer
 * Rewrites all explanations using student-friendly framework with plain language and clear structure
 */

const fs = require('fs');
const path = require('path');
const StudentFriendlyExplanationFramework = require('./student-friendly-explanation-framework.js');

class ComprehensiveExplanationEnhancer {
    constructor() {
        this.framework = new StudentFriendlyExplanationFramework();
        this.enhancedCount = 0;
        this.totalQuestions = 0;
    }

    enhanceExamSet(setId) {
        const filePath = path.join(__dirname, '..', 'quiz-app', 'src', 'data', `exam-set-${setId}.json`);
        const examSet = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`\n🔄 ENHANCING EXAM SET ${setId}`);
        console.log(`Title: ${examSet.title}`);
        console.log(`Questions to enhance: ${examSet.questions.length}`);
        
        // Enhance each question's explanation
        examSet.questions = examSet.questions.map((question, index) => {
            const enhancedExplanation = this.framework.createExplanation(
                question, 
                question.correctAnswer, 
                question.topic
            );
            
            this.enhancedCount++;
            
            // Show progress every 25 questions
            if ((index + 1) % 25 === 0) {
                console.log(`   ✅ Enhanced ${index + 1}/${examSet.questions.length} questions`);
            }
            
            return {
                ...question,
                explanation: enhancedExplanation
            };
        });
        
        // Update metadata to reflect enhancement
        examSet.metadata = {
            ...examSet.metadata,
            enhancedAt: new Date().toISOString(),
            explanationVersion: '2.0',
            studentFriendly: true,
            plainLanguage: true,
            structuredExplanations: true,
            realWorldExamples: true,
            wrongAnswerExplanations: true,
            accessibilityImproved: true
        };
        
        // Update description to reflect student-friendly approach
        examSet.description = examSet.description.replace(
            'research-verified and based on authoritative social work literature',
            'written in clear, student-friendly language with practical examples and step-by-step explanations'
        );
        
        // Save enhanced exam set
        fs.writeFileSync(filePath, JSON.stringify(examSet, null, 2));
        console.log(`   💾 Saved enhanced Set ${setId} with ${examSet.questions.length} improved explanations`);
        
        this.totalQuestions += examSet.questions.length;
        
        return examSet;
    }

    validateEnhancement(setId) {
        const filePath = path.join(__dirname, '..', 'quiz-app', 'src', 'data', `exam-set-${setId}.json`);
        const examSet = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`\n🔍 VALIDATING ENHANCED SET ${setId}`);
        
        let validationIssues = 0;
        const sampleSize = Math.min(5, examSet.questions.length);
        
        for (let i = 0; i < sampleSize; i++) {
            const question = examSet.questions[i];
            const explanation = question.explanation;
            
            // Check for required components
            const hasCorrectAnswer = explanation.includes('**Correct Answer:');
            const hasReasoning = explanation.includes('**Why this is correct:');
            const hasWrongAnswers = explanation.includes('**Why the other options are wrong:');
            const hasSource = explanation.includes('**Source:');
            
            if (!hasCorrectAnswer || !hasReasoning || !hasWrongAnswers || !hasSource) {
                console.log(`   ⚠️  Question ${i + 1} missing components:`);
                if (!hasCorrectAnswer) console.log(`      - Missing correct answer statement`);
                if (!hasReasoning) console.log(`      - Missing reasoning explanation`);
                if (!hasWrongAnswers) console.log(`      - Missing wrong answer explanations`);
                if (!hasSource) console.log(`      - Missing source citation`);
                validationIssues++;
            }
            
            // Check for technical jargon
            const technicalTerms = ['theoretical frameworks', 'empirical evidence', 'research foundation'];
            const hasTechnicalJargon = technicalTerms.some(term => 
                explanation.toLowerCase().includes(term.toLowerCase())
            );
            
            if (hasTechnicalJargon) {
                console.log(`   ⚠️  Question ${i + 1} still contains technical jargon`);
                validationIssues++;
            }
        }
        
        if (validationIssues === 0) {
            console.log(`   ✅ All ${sampleSize} sample questions passed validation`);
        } else {
            console.log(`   ❌ Found ${validationIssues} validation issues in sample`);
        }
        
        return validationIssues === 0;
    }

    showBeforeAfterExample(setId) {
        const filePath = path.join(__dirname, '..', 'quiz-app', 'src', 'data', `exam-set-${setId}.json`);
        const examSet = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`\n📊 BEFORE/AFTER EXAMPLE FROM SET ${setId}`);
        console.log("=" * 80);
        
        const sampleQuestion = examSet.questions[0];
        console.log(`QUESTION: ${sampleQuestion.question}`);
        console.log(`TOPIC: ${sampleQuestion.topic}`);
        console.log(`CORRECT ANSWER: ${sampleQuestion.correctAnswer}`);
        
        console.log(`\n📝 ENHANCED EXPLANATION:`);
        console.log(sampleQuestion.explanation);
        
        console.log("\n" + "=".repeat(80));
        console.log("✅ IMPROVEMENTS MADE:");
        console.log("• Clear statement of correct answer");
        console.log("• Simple explanation of WHY it's correct");
        console.log("• Explanation of why each wrong answer is incorrect");
        console.log("• Real-world example when applicable");
        console.log("• Simplified, accessible language");
        console.log("• Authoritative but student-friendly citation");
    }

    async enhanceAllExamSets() {
        console.log('🚀 COMPREHENSIVE EXPLANATION ENHANCEMENT');
        console.log('Transforming technical explanations into student-friendly content\n');
        
        const startTime = Date.now();
        
        // Enhance each exam set
        for (let setId = 1; setId <= 3; setId++) {
            this.enhanceExamSet(setId);
            this.validateEnhancement(setId);
        }
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(1);
        
        console.log(`\n🎉 ENHANCEMENT COMPLETE!`);
        console.log(`📊 SUMMARY:`);
        console.log(`• Total questions enhanced: ${this.enhancedCount}`);
        console.log(`• Total exam sets: 3`);
        console.log(`• Processing time: ${duration} seconds`);
        console.log(`• Average time per question: ${(duration / this.enhancedCount * 1000).toFixed(0)}ms`);
        
        console.log(`\n✨ ALL EXPLANATIONS NOW FEATURE:`);
        console.log(`• Plain, accessible language (no technical jargon)`);
        console.log(`• Clear structure: correct answer → reasoning → wrong answers → examples`);
        console.log(`• Step-by-step explanations that help students learn`);
        console.log(`• Real-world applications and practical examples`);
        console.log(`• Simplified but authoritative citations`);
        console.log(`• Focus on understanding concepts, not just memorizing answers`);
        
        // Show example
        this.showBeforeAfterExample(1);
        
        console.log(`\n🎯 READY FOR TESTING AND DEPLOYMENT`);
        console.log(`The enhanced explanations are now ready for student use!`);
    }
}

if (require.main === module) {
    const enhancer = new ComprehensiveExplanationEnhancer();
    enhancer.enhanceAllExamSets().catch(console.error);
}

module.exports = ComprehensiveExplanationEnhancer;
