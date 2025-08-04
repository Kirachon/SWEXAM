/**
 * Analyze Topic Distribution Across Exam Sets
 */

const fs = require('fs');
const path = require('path');

function analyzeTopics() {
    const dataDir = path.join(__dirname, '..', 'quiz-app', 'src', 'data');
    
    console.log('📊 TOPIC DISTRIBUTION ANALYSIS\n');
    
    let totalQuestions = 0;
    const allTopics = new Set();
    const topicCounts = {};
    
    for (let setId = 1; setId <= 3; setId++) {
        const filePath = path.join(dataDir, `exam-set-${setId}.json`);
        const examSet = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`📋 SET ${setId}: ${examSet.title}`);
        console.log(`   Questions: ${examSet.questionCount}`);
        console.log(`   Topics: ${examSet.topics.join(', ')}`);
        
        // Count questions by topic in this set
        const setTopicCounts = {};
        examSet.questions.forEach(q => {
            setTopicCounts[q.topic] = (setTopicCounts[q.topic] || 0) + 1;
            topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
            allTopics.add(q.topic);
        });
        
        console.log('   Topic breakdown:');
        Object.entries(setTopicCounts).forEach(([topic, count]) => {
            console.log(`     - ${topic}: ${count} questions`);
        });
        
        totalQuestions += examSet.questionCount;
        console.log('');
    }
    
    console.log('🎯 OVERALL SUMMARY');
    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`Total Topics: ${allTopics.size}`);
    console.log('\n📈 TOPIC DISTRIBUTION ACROSS ALL SETS:');
    
    Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([topic, count]) => {
            const percentage = ((count / totalQuestions) * 100).toFixed(1);
            console.log(`  ${topic}: ${count} questions (${percentage}%)`);
        });
    
    console.log('\n✅ ANALYSIS COMPLETE');
    
    // Check for balanced distribution
    const topicPercentages = Object.values(topicCounts).map(count => (count / totalQuestions) * 100);
    const maxPercentage = Math.max(...topicPercentages);
    const minPercentage = Math.min(...topicPercentages);
    
    console.log('\n🔍 BALANCE ASSESSMENT:');
    console.log(`Highest topic coverage: ${maxPercentage.toFixed(1)}%`);
    console.log(`Lowest topic coverage: ${minPercentage.toFixed(1)}%`);
    console.log(`Coverage range: ${(maxPercentage - minPercentage).toFixed(1)}%`);
    
    if (maxPercentage - minPercentage > 50) {
        console.log('⚠️  WARNING: Significant imbalance in topic distribution');
    } else {
        console.log('✅ Topic distribution appears reasonably balanced');
    }
}

if (require.main === module) {
    analyzeTopics();
}

module.exports = { analyzeTopics };
