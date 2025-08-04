/**
 * Analyze Current Explanation Quality
 * Identifies issues with technical language and accessibility for students
 */

const fs = require('fs');
const path = require('path');

class ExplanationAnalyzer {
    constructor() {
        this.issues = [];
        this.patterns = [];
        this.recommendations = [];
    }

    analyzeExplanation(explanation, questionNumber, setId) {
        const issues = [];
        
        // Check for technical jargon
        const technicalTerms = [
            'theoretical frameworks', 'symbiosis', 'mediating function',
            'phenomenological', 'empirical', 'paradigm', 'conceptualization',
            'operationalization', 'epistemological', 'ontological'
        ];
        
        technicalTerms.forEach(term => {
            if (explanation.toLowerCase().includes(term.toLowerCase())) {
                issues.push(`Technical jargon: "${term}"`);
            }
        });
        
        // Check for overly academic language
        const academicPhrases = [
            'research foundation', 'theoretical underpinnings', 'empirical evidence',
            'conceptual framework', 'methodological approach', 'systematic analysis'
        ];
        
        academicPhrases.forEach(phrase => {
            if (explanation.toLowerCase().includes(phrase.toLowerCase())) {
                issues.push(`Academic language: "${phrase}"`);
            }
        });
        
        // Check explanation structure
        if (!explanation.includes('why')) {
            issues.push('Missing reasoning explanation');
        }
        
        if (!explanation.includes('incorrect') && !explanation.includes('wrong')) {
            issues.push('No explanation of why other options are wrong');
        }
        
        // Check for practical examples
        if (!explanation.includes('example') && !explanation.includes('for instance') && 
            !explanation.includes('such as') && !explanation.includes('like')) {
            issues.push('Lacks concrete examples');
        }
        
        // Check length - too short or too long
        if (explanation.length < 100) {
            issues.push('Explanation too brief');
        } else if (explanation.length > 800) {
            issues.push('Explanation too lengthy');
        }
        
        return issues;
    }

    analyzeExamSet(setId) {
        const filePath = path.join(__dirname, '..', 'quiz-app', 'src', 'data', `exam-set-${setId}.json`);
        const examSet = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`\n📊 ANALYZING EXAM SET ${setId}`);
        console.log(`Title: ${examSet.title}`);
        console.log(`Questions: ${examSet.questions.length}`);
        
        let totalIssues = 0;
        const issueTypes = {};
        
        // Analyze first 10 questions as sample
        for (let i = 0; i < Math.min(10, examSet.questions.length); i++) {
            const question = examSet.questions[i];
            const issues = this.analyzeExplanation(question.explanation, i + 1, setId);
            
            if (issues.length > 0) {
                console.log(`\nQuestion ${i + 1}: "${question.question.substring(0, 50)}..."`);
                console.log(`Topic: ${question.topic}`);
                console.log(`Issues found: ${issues.length}`);
                issues.forEach(issue => {
                    console.log(`  • ${issue}`);
                    issueTypes[issue.split(':')[0]] = (issueTypes[issue.split(':')[0]] || 0) + 1;
                });
                
                // Show current explanation
                console.log(`Current explanation: "${question.explanation.substring(0, 150)}..."`);
            }
            
            totalIssues += issues.length;
        }
        
        console.log(`\n📈 SET ${setId} SUMMARY:`);
        console.log(`Total issues in sample: ${totalIssues}`);
        console.log(`Average issues per question: ${(totalIssues / 10).toFixed(1)}`);
        
        console.log(`\n🔍 ISSUE BREAKDOWN:`);
        Object.entries(issueTypes).forEach(([type, count]) => {
            console.log(`  ${type}: ${count} occurrences`);
        });
        
        return { totalIssues, issueTypes };
    }

    generateRecommendations() {
        console.log(`\n💡 RECOMMENDATIONS FOR IMPROVEMENT:`);
        
        const recommendations = [
            {
                issue: "Technical Jargon",
                solution: "Replace technical terms with plain language explanations",
                example: "Instead of 'theoretical frameworks' → 'research-based ideas'"
            },
            {
                issue: "Academic Language", 
                solution: "Use conversational, student-friendly language",
                example: "Instead of 'research foundation' → 'studies show that'"
            },
            {
                issue: "Missing Reasoning",
                solution: "Add clear step-by-step reasoning for correct answers",
                example: "Explain WHY the answer is correct, not just WHAT it is"
            },
            {
                issue: "No Wrong Answer Explanation",
                solution: "Explain why each incorrect option is wrong",
                example: "Option A is wrong because... Option C is incorrect since..."
            },
            {
                issue: "Lacks Concrete Examples",
                solution: "Include real-world scenarios and practical applications",
                example: "For example, in a support group for grief counseling..."
            }
        ];
        
        recommendations.forEach((rec, index) => {
            console.log(`\n${index + 1}. ${rec.issue}:`);
            console.log(`   Solution: ${rec.solution}`);
            console.log(`   Example: ${rec.example}`);
        });
    }

    async analyzeAllSets() {
        console.log('🔍 SOCIAL WORK EXAMINATION - EXPLANATION QUALITY ANALYSIS\n');
        
        let totalIssuesAllSets = 0;
        const combinedIssueTypes = {};
        
        for (let setId = 1; setId <= 3; setId++) {
            const result = this.analyzeExamSet(setId);
            totalIssuesAllSets += result.totalIssues;
            
            // Combine issue types
            Object.entries(result.issueTypes).forEach(([type, count]) => {
                combinedIssueTypes[type] = (combinedIssueTypes[type] || 0) + count;
            });
        }
        
        console.log(`\n🎯 OVERALL ANALYSIS SUMMARY:`);
        console.log(`Total issues across all sets: ${totalIssuesAllSets}`);
        console.log(`Average issues per question (sample): ${(totalIssuesAllSets / 30).toFixed(1)}`);
        
        console.log(`\n📊 MOST COMMON ISSUES:`);
        const sortedIssues = Object.entries(combinedIssueTypes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
            
        sortedIssues.forEach(([type, count], index) => {
            console.log(`${index + 1}. ${type}: ${count} occurrences`);
        });
        
        this.generateRecommendations();
        
        console.log(`\n✅ ANALYSIS COMPLETE`);
        console.log(`Ready to proceed with explanation enhancement based on identified issues.`);
    }
}

if (require.main === module) {
    const analyzer = new ExplanationAnalyzer();
    analyzer.analyzeAllSets().catch(console.error);
}

module.exports = ExplanationAnalyzer;
