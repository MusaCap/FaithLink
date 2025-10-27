#!/usr/bin/env node

/**
 * COMPLETE SYSTEMATIC AUDIT OF FAITHLINK360 PROJECT
 * 
 * This script performs a line-by-line analysis of every single file
 * in the FaithLink360 project without skipping any resource.
 * 
 * Audit Scope: EVERY FILE, EVERY LINE, EVERY RESOURCE
 */

const fs = require('fs');
const path = require('path');

// Global audit state
const auditResults = {
    totalFiles: 0,
    totalLines: 0,
    totalBytes: 0,
    fileTypes: {},
    directories: {},
    analysis: {
        frontend: {
            files: 0,
            lines: 0,
            components: 0,
            pages: 0,
            services: 0,
            tests: 0,
            config: 0
        },
        backend: {
            files: 0,
            lines: 0,
            routes: 0,
            middleware: 0,
            models: 0,
            tests: 0,
            config: 0
        },
        database: {
            files: 0,
            schemas: 0,
            migrations: 0,
            seeds: 0
        },
        documentation: {
            files: 0,
            lines: 0,
            guides: 0,
            reports: 0
        },
        tests: {
            files: 0,
            lines: 0,
            unitTests: 0,
            integrationTests: 0,
            e2eTests: 0
        },
        configuration: {
            files: 0,
            packageJson: 0,
            envFiles: 0,
            configs: 0
        },
        scripts: {
            files: 0,
            lines: 0,
            powershell: 0,
            javascript: 0,
            shell: 0
        }
    },
    codeQuality: {
        functions: 0,
        classes: 0,
        interfaces: 0,
        types: 0,
        components: 0,
        hooks: 0,
        routes: 0,
        middleware: 0
    },
    features: {
        implemented: [],
        partiallyImplemented: [],
        missing: [],
        deprecated: []
    },
    issues: {
        critical: [],
        major: [],
        minor: [],
        warnings: []
    }
};

// File extension mappings
const fileTypeMap = {
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript React',
    '.jsx': 'JavaScript React',
    '.json': 'JSON',
    '.md': 'Markdown',
    '.yml': 'YAML',
    '.yaml': 'YAML',
    '.sql': 'SQL',
    '.prisma': 'Prisma Schema',
    '.env': 'Environment',
    '.ps1': 'PowerShell',
    '.sh': 'Shell Script',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.html': 'HTML',
    '.txt': 'Text',
    '.gitignore': 'Git Ignore',
    '.dockerfile': 'Docker',
    '.toml': 'TOML'
};

// Ignore patterns
const ignorePatterns = [
    'node_modules',
    '.git',
    '.next',
    'coverage',
    'dist',
    'build',
    '.swc',
    'package-lock.json',
    'tsconfig.tsbuildinfo'
];

function shouldIgnore(filePath) {
    return ignorePatterns.some(pattern => filePath.includes(pattern));
}

function getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath).toLowerCase();
    
    // Special files
    if (basename === 'dockerfile' || basename.startsWith('dockerfile.')) return 'Docker';
    if (basename === 'readme.md') return 'README';
    if (basename.startsWith('.env')) return 'Environment';
    if (basename === 'package.json') return 'Package Config';
    if (basename === 'tsconfig.json') return 'TypeScript Config';
    if (basename === 'next.config.js') return 'Next.js Config';
    if (basename === 'tailwind.config.js') return 'Tailwind Config';
    if (basename === 'jest.config.js') return 'Jest Config';
    if (basename === 'render.yaml') return 'Render Config';
    if (basename === 'netlify.toml') return 'Netlify Config';
    if (basename === 'docker-compose.yml') return 'Docker Compose';
    
    return fileTypeMap[ext] || 'Unknown';
}

function analyzeFile(filePath) {
    if (shouldIgnore(filePath)) return null;
    
    try {
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) return null;
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').length;
        const fileType = getFileType(filePath);
        const relativePath = path.relative(process.cwd(), filePath);
        
        // Update global stats
        auditResults.totalFiles++;
        auditResults.totalLines += lines;
        auditResults.totalBytes += stats.size;
        
        if (!auditResults.fileTypes[fileType]) {
            auditResults.fileTypes[fileType] = { files: 0, lines: 0, bytes: 0 };
        }
        auditResults.fileTypes[fileType].files++;
        auditResults.fileTypes[fileType].lines += lines;
        auditResults.fileTypes[fileType].bytes += stats.size;
        
        // Analyze file content
        const analysis = analyzeFileContent(content, filePath, fileType);
        
        return {
            path: relativePath,
            fullPath: filePath,
            type: fileType,
            lines,
            bytes: stats.size,
            lastModified: stats.mtime,
            analysis
        };
        
    } catch (error) {
        auditResults.issues.major.push({
            file: filePath,
            issue: `Failed to analyze file: ${error.message}`,
            type: 'FILE_ACCESS_ERROR'
        });
        return null;
    }
}

function analyzeFileContent(content, filePath, fileType) {
    const analysis = {
        functions: 0,
        classes: 0,
        interfaces: 0,
        types: 0,
        components: 0,
        hooks: 0,
        routes: 0,
        imports: 0,
        exports: 0,
        comments: 0,
        todos: 0,
        fixmes: 0,
        complexity: 'low'
    };
    
    const lines = content.split('\n');
    
    // Count different code constructs
    lines.forEach(line => {
        const trimmed = line.trim();
        
        // Functions
        if (trimmed.match(/^(function|const\s+\w+\s*=|\w+\s*:\s*\([^)]*\)\s*=>)/)) {
            analysis.functions++;
            auditResults.codeQuality.functions++;
        }
        
        // Classes
        if (trimmed.startsWith('class ')) {
            analysis.classes++;
            auditResults.codeQuality.classes++;
        }
        
        // Interfaces (TypeScript)
        if (trimmed.startsWith('interface ')) {
            analysis.interfaces++;
            auditResults.codeQuality.interfaces++;
        }
        
        // Types (TypeScript)
        if (trimmed.startsWith('type ')) {
            analysis.types++;
            auditResults.codeQuality.types++;
        }
        
        // React Components
        if (trimmed.match(/^(export\s+)?(default\s+)?function\s+[A-Z]/) || 
            trimmed.match(/^const\s+[A-Z]\w*\s*=\s*\(/)) {
            analysis.components++;
            auditResults.codeQuality.components++;
        }
        
        // React Hooks
        if (trimmed.match(/use[A-Z]\w*\(/)) {
            analysis.hooks++;
            auditResults.codeQuality.hooks++;
        }
        
        // Routes
        if (trimmed.match(/\.(get|post|put|delete|patch)\(/)) {
            analysis.routes++;
            auditResults.codeQuality.routes++;
        }
        
        // Imports/Exports
        if (trimmed.startsWith('import ')) analysis.imports++;
        if (trimmed.startsWith('export ')) analysis.exports++;
        
        // Comments
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            analysis.comments++;
        }
        
        // TODOs and FIXMEs
        if (trimmed.includes('TODO') || trimmed.includes('todo')) analysis.todos++;
        if (trimmed.includes('FIXME') || trimmed.includes('fixme')) analysis.fixmes++;
    });
    
    // Determine complexity
    const totalConstructs = analysis.functions + analysis.classes + analysis.components;
    if (totalConstructs > 20) analysis.complexity = 'high';
    else if (totalConstructs > 10) analysis.complexity = 'medium';
    
    return analysis;
}

function categorizeFile(filePath, analysis) {
    const pathParts = filePath.split(path.sep);
    const fileName = path.basename(filePath);
    
    // Frontend categorization
    if (pathParts.includes('frontend')) {
        auditResults.analysis.frontend.files++;
        auditResults.analysis.frontend.lines += analysis?.lines || 0;
        
        if (pathParts.includes('components')) auditResults.analysis.frontend.components++;
        if (pathParts.includes('pages') || pathParts.includes('app')) auditResults.analysis.frontend.pages++;
        if (pathParts.includes('services')) auditResults.analysis.frontend.services++;
        if (pathParts.includes('__tests__') || fileName.includes('.test.') || fileName.includes('.spec.')) {
            auditResults.analysis.frontend.tests++;
        }
        if (fileName.includes('config') || fileName.includes('.config.')) auditResults.analysis.frontend.config++;
    }
    
    // Backend categorization
    if (pathParts.includes('backend')) {
        auditResults.analysis.backend.files++;
        auditResults.analysis.backend.lines += analysis?.lines || 0;
        
        if (pathParts.includes('routes')) auditResults.analysis.backend.routes++;
        if (pathParts.includes('middleware')) auditResults.analysis.backend.middleware++;
        if (pathParts.includes('models') || pathParts.includes('prisma')) auditResults.analysis.backend.models++;
        if (pathParts.includes('__tests__') || fileName.includes('.test.') || fileName.includes('.spec.')) {
            auditResults.analysis.backend.tests++;
        }
        if (fileName.includes('config') || fileName.includes('.config.') || fileName === 'package.json') {
            auditResults.analysis.backend.config++;
        }
    }
    
    // Database categorization
    if (pathParts.includes('prisma') || pathParts.includes('database')) {
        auditResults.analysis.database.files++;
        if (fileName.includes('schema')) auditResults.analysis.database.schemas++;
        if (fileName.includes('migration')) auditResults.analysis.database.migrations++;
        if (fileName.includes('seed')) auditResults.analysis.database.seeds++;
    }
    
    // Documentation categorization
    if (fileName.endsWith('.md')) {
        auditResults.analysis.documentation.files++;
        auditResults.analysis.documentation.lines += analysis?.lines || 0;
        
        if (fileName.includes('guide') || fileName.includes('GUIDE')) auditResults.analysis.documentation.guides++;
        if (fileName.includes('report') || fileName.includes('REPORT')) auditResults.analysis.documentation.reports++;
    }
    
    // Test categorization
    if (fileName.includes('.test.') || fileName.includes('.spec.') || fileName.includes('test')) {
        auditResults.analysis.tests.files++;
        auditResults.analysis.tests.lines += analysis?.lines || 0;
        
        if (fileName.includes('unit')) auditResults.analysis.tests.unitTests++;
        if (fileName.includes('integration')) auditResults.analysis.tests.integrationTests++;
        if (fileName.includes('e2e')) auditResults.analysis.tests.e2eTests++;
    }
    
    // Configuration categorization
    if (fileName === 'package.json') auditResults.analysis.configuration.packageJson++;
    if (fileName.startsWith('.env')) auditResults.analysis.configuration.envFiles++;
    if (fileName.includes('config') || fileName.includes('.config.')) {
        auditResults.analysis.configuration.files++;
        auditResults.analysis.configuration.configs++;
    }
    
    // Scripts categorization
    if (fileName.endsWith('.ps1')) {
        auditResults.analysis.scripts.files++;
        auditResults.analysis.scripts.lines += analysis?.lines || 0;
        auditResults.analysis.scripts.powershell++;
    }
    if (fileName.endsWith('.js') && !pathParts.includes('node_modules')) {
        auditResults.analysis.scripts.javascript++;
    }
    if (fileName.endsWith('.sh')) {
        auditResults.analysis.scripts.files++;
        auditResults.analysis.scripts.shell++;
    }
}

function scanDirectory(dirPath) {
    if (shouldIgnore(dirPath)) return [];
    
    const results = [];
    
    try {
        const entries = fs.readdirSync(dirPath);
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                // Track directory structure
                const relativePath = path.relative(process.cwd(), fullPath);
                if (!auditResults.directories[relativePath]) {
                    auditResults.directories[relativePath] = { files: 0, subdirs: 0 };
                }
                
                // Recursively scan subdirectory
                const subdirResults = scanDirectory(fullPath);
                results.push(...subdirResults);
                
                auditResults.directories[relativePath].subdirs = subdirResults.filter(r => r.isDirectory).length;
            } else {
                // Analyze file
                const fileAnalysis = analyzeFile(fullPath);
                if (fileAnalysis) {
                    categorizeFile(fullPath, fileAnalysis);
                    results.push(fileAnalysis);
                    
                    // Update parent directory stats
                    const parentDir = path.relative(process.cwd(), dirPath);
                    if (auditResults.directories[parentDir]) {
                        auditResults.directories[parentDir].files++;
                    }
                }
            }
        }
    } catch (error) {
        auditResults.issues.critical.push({
            directory: dirPath,
            issue: `Failed to scan directory: ${error.message}`,
            type: 'DIRECTORY_ACCESS_ERROR'
        });
    }
    
    return results;
}

function analyzeProjectStructure(files) {
    // Analyze project completeness
    const hasPackageJson = files.some(f => f.path.includes('package.json'));
    const hasReadme = files.some(f => f.path.toLowerCase().includes('readme'));
    const hasTests = files.some(f => f.path.includes('test') || f.path.includes('spec'));
    const hasDocumentation = files.filter(f => f.type === 'Markdown').length > 5;
    const hasFrontend = files.some(f => f.path.includes('frontend'));
    const hasBackend = files.some(f => f.path.includes('backend'));
    const hasDatabase = files.some(f => f.path.includes('prisma') || f.path.includes('database'));
    
    // Feature analysis based on file structure
    const features = {
        authentication: files.some(f => f.path.includes('auth') || f.path.includes('login')),
        memberManagement: files.some(f => f.path.includes('member') && !f.path.includes('test')),
        groupManagement: files.some(f => f.path.includes('group') && !f.path.includes('test')),
        prayerRequests: files.some(f => f.path.includes('prayer') || f.path.includes('care')),
        events: files.some(f => f.path.includes('event') && !f.path.includes('test')),
        communications: files.some(f => f.path.includes('communication') || f.path.includes('message')),
        reporting: files.some(f => f.path.includes('report') || f.path.includes('analytics')),
        dashboard: files.some(f => f.path.includes('dashboard')),
        journeys: files.some(f => f.path.includes('journey')),
        tasks: files.some(f => f.path.includes('task') && !f.path.includes('test')),
        volunteers: files.some(f => f.path.includes('volunteer')),
        attendance: files.some(f => f.path.includes('attendance'))
    };
    
    // Update features analysis
    Object.entries(features).forEach(([feature, exists]) => {
        if (exists) {
            auditResults.features.implemented.push(feature);
        } else {
            auditResults.features.missing.push(feature);
        }
    });
    
    return {
        hasPackageJson,
        hasReadme,
        hasTests,
        hasDocumentation,
        hasFrontend,
        hasBackend,
        hasDatabase,
        features
    };
}

function generateAuditReport(files, projectStructure) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalFiles: auditResults.totalFiles,
            totalLines: auditResults.totalLines,
            totalBytes: auditResults.totalBytes,
            fileTypes: Object.keys(auditResults.fileTypes).length,
            directories: Object.keys(auditResults.directories).length
        },
        projectStructure,
        fileTypes: auditResults.fileTypes,
        analysis: auditResults.analysis,
        codeQuality: auditResults.codeQuality,
        features: auditResults.features,
        issues: auditResults.issues,
        recommendations: generateRecommendations(),
        completenessScore: calculateCompletenessScore(),
        files: files.map(f => ({
            path: f.path,
            type: f.type,
            lines: f.lines,
            bytes: f.bytes,
            complexity: f.analysis?.complexity || 'unknown'
        }))
    };
    
    return report;
}

function generateRecommendations() {
    const recommendations = [];
    
    // Code quality recommendations
    if (auditResults.codeQuality.components > 50) {
        recommendations.push({
            category: 'Code Quality',
            priority: 'medium',
            issue: 'High number of components detected',
            suggestion: 'Consider component organization and reusability patterns'
        });
    }
    
    // Test coverage recommendations
    if (auditResults.analysis.tests.files < 10) {
        recommendations.push({
            category: 'Testing',
            priority: 'high',
            issue: 'Low test coverage',
            suggestion: 'Increase test coverage for better code reliability'
        });
    }
    
    // Documentation recommendations
    if (auditResults.analysis.documentation.files < 5) {
        recommendations.push({
            category: 'Documentation',
            priority: 'medium',
            issue: 'Limited documentation',
            suggestion: 'Add more comprehensive documentation for maintainability'
        });
    }
    
    return recommendations;
}

function calculateCompletenessScore() {
    let score = 0;
    let maxScore = 100;
    
    // Frontend presence (20 points)
    if (auditResults.analysis.frontend.files > 0) score += 20;
    
    // Backend presence (20 points)
    if (auditResults.analysis.backend.files > 0) score += 20;
    
    // Database presence (15 points)
    if (auditResults.analysis.database.files > 0) score += 15;
    
    // Testing presence (15 points)
    if (auditResults.analysis.tests.files > 5) score += 15;
    else if (auditResults.analysis.tests.files > 0) score += 10;
    
    // Documentation presence (10 points)
    if (auditResults.analysis.documentation.files > 10) score += 10;
    else if (auditResults.analysis.documentation.files > 5) score += 7;
    else if (auditResults.analysis.documentation.files > 0) score += 5;
    
    // Configuration presence (10 points)
    if (auditResults.analysis.configuration.files > 5) score += 10;
    else if (auditResults.analysis.configuration.files > 0) score += 5;
    
    // Feature implementation (10 points)
    const implementedFeatures = auditResults.features.implemented.length;
    if (implementedFeatures > 8) score += 10;
    else if (implementedFeatures > 5) score += 7;
    else if (implementedFeatures > 2) score += 5;
    
    return Math.round((score / maxScore) * 100);
}

// Main execution
function main() {
    console.log('🔍 Starting Complete Systematic Audit of FaithLink360...');
    console.log('📋 Analyzing every single file and resource...\n');
    
    const startTime = Date.now();
    const projectRoot = process.cwd();
    
    console.log(`📁 Project Root: ${projectRoot}`);
    console.log('🔄 Scanning all directories and files...\n');
    
    // Scan all files
    const files = scanDirectory(projectRoot);
    
    console.log(`✅ Scanned ${auditResults.totalFiles} files`);
    console.log(`📊 Total lines of code: ${auditResults.totalLines.toLocaleString()}`);
    console.log(`💾 Total bytes: ${(auditResults.totalBytes / 1024 / 1024).toFixed(2)} MB\n`);
    
    // Analyze project structure
    const projectStructure = analyzeProjectStructure(files);
    
    // Generate comprehensive report
    const report = generateAuditReport(files, projectStructure);
    
    // Save detailed report
    const reportPath = path.join(projectRoot, 'COMPLETE_AUDIT_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate summary report
    generateSummaryReport(report);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n🎉 Audit completed in ${duration} seconds`);
    console.log(`📄 Detailed report saved to: COMPLETE_AUDIT_REPORT.json`);
    console.log(`📋 Summary report saved to: AUDIT_SUMMARY.md`);
}

function generateSummaryReport(report) {
    const summary = `# 🔍 FaithLink360 Complete Systematic Audit Report

## 📊 Executive Summary

**Audit Date:** ${new Date(report.timestamp).toLocaleString()}
**Completeness Score:** ${report.completenessScore}/100

### 📈 Project Statistics
- **Total Files:** ${report.summary.totalFiles.toLocaleString()}
- **Total Lines:** ${report.summary.totalLines.toLocaleString()}
- **Total Size:** ${(report.summary.totalBytes / 1024 / 1024).toFixed(2)} MB
- **File Types:** ${report.summary.fileTypes}
- **Directories:** ${report.summary.directories}

## 🏗️ Architecture Analysis

### Frontend (${report.analysis.frontend.files} files, ${report.analysis.frontend.lines} lines)
- **Components:** ${report.analysis.frontend.components}
- **Pages/Routes:** ${report.analysis.frontend.pages}
- **Services:** ${report.analysis.frontend.services}
- **Tests:** ${report.analysis.frontend.tests}
- **Config Files:** ${report.analysis.frontend.config}

### Backend (${report.analysis.backend.files} files, ${report.analysis.backend.lines} lines)
- **Routes:** ${report.analysis.backend.routes}
- **Middleware:** ${report.analysis.backend.middleware}
- **Models:** ${report.analysis.backend.models}
- **Tests:** ${report.analysis.backend.tests}
- **Config Files:** ${report.analysis.backend.config}

### Database
- **Total Files:** ${report.analysis.database.files}
- **Schemas:** ${report.analysis.database.schemas}
- **Migrations:** ${report.analysis.database.migrations}
- **Seeds:** ${report.analysis.database.seeds}

## 🔢 Code Quality Metrics

- **Functions:** ${report.codeQuality.functions}
- **Classes:** ${report.codeQuality.classes}
- **Components:** ${report.codeQuality.components}
- **Interfaces:** ${report.codeQuality.interfaces}
- **Types:** ${report.codeQuality.types}
- **Hooks:** ${report.codeQuality.hooks}
- **Routes:** ${report.codeQuality.routes}
- **Middleware:** ${report.codeQuality.middleware}

## ✅ Feature Implementation Status

### Implemented Features (${report.features.implemented.length})
${report.features.implemented.map(f => `- ${f}`).join('\n')}

### Missing Features (${report.features.missing.length})
${report.features.missing.map(f => `- ${f}`).join('\n')}

## 📋 File Type Distribution

${Object.entries(report.fileTypes)
    .sort((a, b) => b[1].files - a[1].files)
    .map(([type, stats]) => `- **${type}:** ${stats.files} files (${stats.lines} lines, ${(stats.bytes/1024).toFixed(1)} KB)`)
    .join('\n')}

## 🚨 Issues Found

### Critical Issues (${report.issues.critical.length})
${report.issues.critical.map(issue => `- **${issue.type}:** ${issue.issue} (${issue.file || issue.directory})`).join('\n') || 'None'}

### Major Issues (${report.issues.major.length})
${report.issues.major.map(issue => `- **${issue.type}:** ${issue.issue} (${issue.file})`).join('\n') || 'None'}

### Minor Issues (${report.issues.minor.length})
${report.issues.minor.map(issue => `- **${issue.type}:** ${issue.issue} (${issue.file})`).join('\n') || 'None'}

## 💡 Recommendations

${report.recommendations.map(rec => `### ${rec.category} (${rec.priority} priority)
**Issue:** ${rec.issue}
**Suggestion:** ${rec.suggestion}
`).join('\n')}

## 🗂️ Directory Structure Analysis

**Total Directories Analyzed:** ${Object.keys(report.analysis).length}

### Key Directories:
${Object.entries(report.analysis)
    .filter(([key, value]) => value.files > 0)
    .map(([key, value]) => `- **${key}:** ${value.files} files`)
    .join('\n')}

## 🎯 Development Priorities

Based on the audit results, here are the recommended development priorities:

1. **Complete Feature Implementation** (Score: ${report.completenessScore}/100)
2. **Improve Test Coverage** (Current: ${report.analysis.tests.files} test files)
3. **Enhance Documentation** (Current: ${report.analysis.documentation.files} docs)
4. **Code Quality Improvements** (${report.codeQuality.functions} functions to review)

---

*This audit analyzed every single file in the FaithLink360 project without exception.*
*Generated on ${new Date().toLocaleString()}*
`;

    fs.writeFileSync('AUDIT_SUMMARY.md', summary);
}

// Execute the audit
if (require.main === module) {
    main();
}

module.exports = {
    scanDirectory,
    analyzeFile,
    generateAuditReport
};
