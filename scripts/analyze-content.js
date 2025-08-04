const fs = require('fs');
const path = require('path');

/**
 * Content Analysis Script
 * Analyzes extracted PDF content to identify topics, concepts, and structure
 * for question generation
 */

class ContentAnalyzer {
    constructor() {
        this.contentDir = path.join(__dirname, '..', 'extracted-content');
        this.outputDir = path.join(__dirname, '..', 'content-analysis');
        this.analysis = {
            files: [],
            topics: new Map(),
            concepts: new Map(),
            definitions: [],
            keyTerms: new Set(),
            totalContent: {
                words: 0,
                characters: 0,
                lines: 0
            }
        };
    }

    /**
     * Initialize content analysis
     */
    async init() {
        console.log('🔍 Starting content analysis...');
        
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        await this.analyzeAllFiles();
        await this.identifyTopics();
        await this.extractDefinitions();
        await this.generateAnalysisReport();
        
        console.log('✅ Content analysis completed!');
    }

    /**
     * Analyze all extracted text files
     */
    async analyzeAllFiles() {
        const files = fs.readdirSync(this.contentDir);
        const textFiles = files.filter(file => file.endsWith('.txt'));
        
        console.log(`📚 Analyzing ${textFiles.length} text files...`);

        for (const file of textFiles) {
            await this.analyzeFile(file);
        }
    }

    /**
     * Analyze individual file content
     */
    async analyzeFile(filename) {
        const filePath = path.join(this.contentDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const lines = content.split('\n');
        const words = content.split(/\s+/).filter(word => word.length > 0);
        
        const fileAnalysis = {
            filename: filename,
            lines: lines.length,
            words: words.length,
            characters: content.length,
            topics: this.extractTopicsFromFile(content),
            keyTerms: this.extractKeyTerms(content),
            structure: this.analyzeStructure(lines)
        };

        this.analysis.files.push(fileAnalysis);
        this.analysis.totalContent.words += words.length;
        this.analysis.totalContent.characters += content.length;
        this.analysis.totalContent.lines += lines.length;

        console.log(`   ✓ ${filename}: ${words.length} words, ${fileAnalysis.topics.length} topics`);
    }

    /**
     * Extract topics from file content
     */
    extractTopicsFromFile(content) {
        const topics = [];
        const lines = content.split('\n');
        
        // Look for headings and major topics
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Detect headings (lines that are short, capitalized, or numbered)
            if (line.length > 0 && line.length < 100) {
                if (this.isHeading(line)) {
                    topics.push({
                        title: line,
                        lineNumber: i + 1,
                        type: this.getHeadingType(line)
                    });
                }
            }
        }
        
        return topics;
    }

    /**
     * Check if a line is likely a heading
     */
    isHeading(line) {
        // Check for various heading patterns
        const patterns = [
            /^[A-Z][A-Z\s]+$/, // ALL CAPS
            /^\d+\.\s/, // Numbered (1. 2. etc.)
            /^[a-z]\.\s/, // Lettered (a. b. etc.)
            /^•\s/, // Bullet points
            /^[A-Z][a-z\s]+:$/, // Title with colon
            /^[A-Z][a-z\s]+ (Approach|Model|Phase|Stage|Process|Structure)/, // Common social work terms
        ];
        
        return patterns.some(pattern => pattern.test(line));
    }

    /**
     * Determine heading type
     */
    getHeadingType(line) {
        if (/^[A-Z][A-Z\s]+$/.test(line)) return 'major';
        if (/^\d+\./.test(line)) return 'numbered';
        if (/^[a-z]\./.test(line)) return 'lettered';
        if (/^•/.test(line)) return 'bullet';
        return 'general';
    }

    /**
     * Extract key terms and concepts
     */
    extractKeyTerms(content) {
        const keyTerms = new Set();
        
        // Social work specific terms
        const socialWorkTerms = [
            'group work', 'social group work', 'group development', 'group process',
            'group structure', 'group dynamics', 'social worker', 'group member',
            'treatment group', 'task group', 'formed group', 'natural group',
            'group formation', 'group norms', 'group roles', 'group cohesion',
            'mutual aid', 'empowerment', 'intervention', 'assessment',
            'developmental approach', 'remedial approach', 'social goals model',
            'reciprocal model', 'mediating model'
        ];

        const lowerContent = content.toLowerCase();
        
        socialWorkTerms.forEach(term => {
            if (lowerContent.includes(term.toLowerCase())) {
                keyTerms.add(term);
            }
        });

        return Array.from(keyTerms);
    }

    /**
     * Analyze content structure
     */
    analyzeStructure(lines) {
        let structure = {
            hasNumberedSections: false,
            hasLetterSections: false,
            hasBulletPoints: false,
            hasDefinitions: false,
            definitionCount: 0
        };

        lines.forEach(line => {
            const trimmed = line.trim();
            if (/^\d+\./.test(trimmed)) structure.hasNumberedSections = true;
            if (/^[a-z]\./.test(trimmed)) structure.hasLetterSections = true;
            if (/^•/.test(trimmed)) structure.hasBulletPoints = true;
            if (trimmed.includes(' is defined as ') || trimmed.includes(' refers to ')) {
                structure.hasDefinitions = true;
                structure.definitionCount++;
            }
        });

        return structure;
    }

    /**
     * Identify main topics across all content
     */
    async identifyTopics() {
        console.log('🏷️  Identifying main topics...');
        
        const allTopics = this.analysis.files.flatMap(file => file.topics);
        
        // Group similar topics
        const topicGroups = new Map();
        
        allTopics.forEach(topic => {
            const key = this.normalizeTopicTitle(topic.title);
            if (!topicGroups.has(key)) {
                topicGroups.set(key, []);
            }
            topicGroups.get(key).push(topic);
        });

        this.analysis.topics = topicGroups;
        console.log(`   ✓ Found ${topicGroups.size} unique topic groups`);
    }

    /**
     * Normalize topic titles for grouping
     */
    normalizeTopicTitle(title) {
        return title.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Extract definitions from content
     */
    async extractDefinitions() {
        console.log('📖 Extracting definitions...');
        
        for (const file of this.analysis.files) {
            const filePath = path.join(this.contentDir, file.filename);
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                const trimmed = line.trim();
                if (this.isDefinition(trimmed)) {
                    this.analysis.definitions.push({
                        text: trimmed,
                        file: file.filename,
                        lineNumber: index + 1,
                        term: this.extractTerm(trimmed)
                    });
                }
            });
        }
        
        console.log(`   ✓ Found ${this.analysis.definitions.length} definitions`);
    }

    /**
     * Check if a line contains a definition
     */
    isDefinition(line) {
        const definitionPatterns = [
            / is defined as /i,
            / refers to /i,
            / means /i,
            / is a /i,
            / are /i,
            /^[a-z]\. .+ is /i
        ];
        
        return definitionPatterns.some(pattern => pattern.test(line)) && line.length > 20;
    }

    /**
     * Extract the term being defined
     */
    extractTerm(definitionLine) {
        const patterns = [
            /^([^.]+)\. (.+) is defined as/i,
            /^([^.]+)\. (.+) refers to/i,
            /^(.+) is defined as/i,
            /^(.+) refers to/i,
            /^(.+) means/i,
            /^(.+) is a/i
        ];
        
        for (const pattern of patterns) {
            const match = definitionLine.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        
        return definitionLine.substring(0, 50) + '...';
    }

    /**
     * Generate comprehensive analysis report
     */
    async generateAnalysisReport() {
        const report = {
            summary: {
                totalFiles: this.analysis.files.length,
                totalWords: this.analysis.totalContent.words,
                totalCharacters: this.analysis.totalContent.characters,
                totalLines: this.analysis.totalContent.lines,
                totalTopics: this.analysis.topics.size,
                totalDefinitions: this.analysis.definitions.length,
                analyzedAt: new Date().toISOString()
            },
            files: this.analysis.files.map(file => ({
                filename: file.filename,
                words: file.words,
                lines: file.lines,
                topics: file.topics.length,
                keyTerms: file.keyTerms.length,
                structure: file.structure
            })),
            topicGroups: Array.from(this.analysis.topics.entries()).map(([key, topics]) => ({
                normalizedTitle: key,
                count: topics.length,
                examples: topics.slice(0, 3).map(t => t.title)
            })),
            definitions: this.analysis.definitions.slice(0, 20), // First 20 definitions
            questionGenerationFeasibility: this.assessQuestionFeasibility()
        };

        // Save analysis report
        const reportPath = path.join(this.outputDir, 'content-analysis.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('\n📊 CONTENT ANALYSIS SUMMARY:');
        console.log(`   📁 Files analyzed: ${report.summary.totalFiles}`);
        console.log(`   📝 Total words: ${report.summary.totalWords.toLocaleString()}`);
        console.log(`   🏷️  Topics identified: ${report.summary.totalTopics}`);
        console.log(`   📖 Definitions found: ${report.summary.totalDefinitions}`);
        console.log(`   🎯 Question feasibility: ${report.questionGenerationFeasibility.assessment}`);
        console.log(`   💾 Report saved to: content-analysis.json`);

        return report;
    }

    /**
     * Assess feasibility of generating 1000 questions
     */
    assessQuestionFeasibility() {
        const wordsPerQuestion = 50; // Estimated words needed per quality question
        const questionsNeeded = 1000;
        const wordsNeeded = questionsNeeded * wordsPerQuestion;
        const availableWords = this.analysis.totalContent.words;
        
        const feasibility = {
            questionsNeeded,
            availableWords,
            wordsNeeded,
            ratio: availableWords / wordsNeeded,
            assessment: availableWords >= wordsNeeded ? 'FEASIBLE' : 'CHALLENGING',
            recommendations: []
        };

        if (feasibility.ratio < 1) {
            feasibility.recommendations.push('Consider generating multiple questions per concept');
            feasibility.recommendations.push('Create variations of similar questions');
            feasibility.recommendations.push('Generate scenario-based questions');
        }

        if (this.analysis.definitions.length > 0) {
            feasibility.recommendations.push(`${this.analysis.definitions.length} definitions available for direct questions`);
        }

        return feasibility;
    }
}

// Run analysis if script is executed directly
if (require.main === module) {
    const analyzer = new ContentAnalyzer();
    analyzer.init().catch(error => {
        console.error('💥 Fatal error during analysis:', error);
        process.exit(1);
    });
}

module.exports = ContentAnalyzer;
