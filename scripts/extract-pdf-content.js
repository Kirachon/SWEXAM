const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

/**
 * PDF Content Extraction Script
 * Extracts text content from all PDF files in the workspace
 * and saves the raw text for further processing
 */

class PDFExtractor {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'extracted-content');
        this.pdfDir = path.join(__dirname, '..');
        this.results = [];
    }

    /**
     * Initialize the extraction process
     */
    async init() {
        console.log('🚀 Starting PDF content extraction...');
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
            console.log(`📁 Created output directory: ${this.outputDir}`);
        }

        await this.extractAllPDFs();
        await this.generateSummaryReport();
        
        console.log('✅ PDF extraction completed successfully!');
    }

    /**
     * Find and extract content from all PDF files
     */
    async extractAllPDFs() {
        const files = fs.readdirSync(this.pdfDir);
        const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
        
        console.log(`📚 Found ${pdfFiles.length} PDF files to process:`);
        pdfFiles.forEach(file => console.log(`   - ${file}`));

        for (const pdfFile of pdfFiles) {
            await this.extractPDF(pdfFile);
        }
    }

    /**
     * Extract text content from a single PDF file
     */
    async extractPDF(filename) {
        try {
            console.log(`\n📖 Processing: ${filename}`);
            
            const pdfPath = path.join(this.pdfDir, filename);
            const dataBuffer = fs.readFileSync(pdfPath);
            
            // Extract text using pdf-parse
            const data = await pdf(dataBuffer);
            
            const result = {
                filename: filename,
                pages: data.numpages,
                textLength: data.text.length,
                wordCount: data.text.split(/\s+/).filter(word => word.length > 0).length,
                extractedAt: new Date().toISOString(),
                content: data.text
            };

            // Save extracted text to file
            const outputFilename = filename.replace('.pdf', '.txt');
            const outputPath = path.join(this.outputDir, outputFilename);
            fs.writeFileSync(outputPath, data.text, 'utf8');

            // Save metadata
            const metadataPath = path.join(this.outputDir, filename.replace('.pdf', '_metadata.json'));
            fs.writeFileSync(metadataPath, JSON.stringify({
                filename: result.filename,
                pages: result.pages,
                textLength: result.textLength,
                wordCount: result.wordCount,
                extractedAt: result.extractedAt
            }, null, 2));

            this.results.push(result);
            
            console.log(`   ✓ Pages: ${result.pages}`);
            console.log(`   ✓ Text length: ${result.textLength.toLocaleString()} characters`);
            console.log(`   ✓ Word count: ${result.wordCount.toLocaleString()} words`);
            console.log(`   ✓ Saved to: ${outputFilename}`);

        } catch (error) {
            console.error(`❌ Error processing ${filename}:`, error.message);
            this.results.push({
                filename: filename,
                error: error.message,
                extractedAt: new Date().toISOString()
            });
        }
    }

    /**
     * Generate a summary report of the extraction process
     */
    async generateSummaryReport() {
        const totalFiles = this.results.length;
        const successfulExtractions = this.results.filter(r => !r.error).length;
        const totalPages = this.results.reduce((sum, r) => sum + (r.pages || 0), 0);
        const totalWords = this.results.reduce((sum, r) => sum + (r.wordCount || 0), 0);
        const totalCharacters = this.results.reduce((sum, r) => sum + (r.textLength || 0), 0);

        const report = {
            summary: {
                totalFiles,
                successfulExtractions,
                failedExtractions: totalFiles - successfulExtractions,
                totalPages,
                totalWords,
                totalCharacters,
                extractedAt: new Date().toISOString()
            },
            files: this.results.map(r => ({
                filename: r.filename,
                success: !r.error,
                pages: r.pages || 0,
                wordCount: r.wordCount || 0,
                textLength: r.textLength || 0,
                error: r.error || null
            }))
        };

        // Save summary report
        const reportPath = path.join(this.outputDir, 'extraction-summary.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('\n📊 EXTRACTION SUMMARY:');
        console.log(`   📁 Total files processed: ${totalFiles}`);
        console.log(`   ✅ Successful extractions: ${successfulExtractions}`);
        console.log(`   ❌ Failed extractions: ${totalFiles - successfulExtractions}`);
        console.log(`   📄 Total pages: ${totalPages.toLocaleString()}`);
        console.log(`   📝 Total words: ${totalWords.toLocaleString()}`);
        console.log(`   🔤 Total characters: ${totalCharacters.toLocaleString()}`);
        console.log(`   💾 Report saved to: extraction-summary.json`);

        return report;
    }
}

// Run the extraction if this script is executed directly
if (require.main === module) {
    const extractor = new PDFExtractor();
    extractor.init().catch(error => {
        console.error('💥 Fatal error during extraction:', error);
        process.exit(1);
    });
}

module.exports = PDFExtractor;
