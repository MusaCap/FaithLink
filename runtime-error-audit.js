/**
 * Runtime Error Audit Script
 * Following Semantic Seed Venture Studio Coding Standards V2.0
 * Systematically detects potential undefined property access patterns
 */

const fs = require('fs');
const path = require('path');

// Common undefined access patterns that cause runtime errors
const RUNTIME_ERROR_PATTERNS = [
  // Array method calls on potentially undefined variables
  /(\w+)\.map\(/g,
  /(\w+)\.filter\(/g,
  /(\w+)\.forEach\(/g,
  /(\w+)\.reduce\(/g,
  /(\w+)\.find\(/g,
  /(\w+)\.length/g,
  /(\w+)\.join\(/g,
  /(\w+)\.slice\(/g,
  /(\w+)\.sort\(/g,
  
  // Object property access without null checks
  /(\w+)\.(\w+)\.(\w+)/g,
  /(\w+)\[(\w+)\]\.(\w+)/g,
  
  // Common destructuring that can fail
  /const\s*{\s*\w+.*}\s*=\s*(\w+);/g,
  
  // State or prop access without guards
  /props\.(\w+)\.(\w+)/g,
  /state\.(\w+)\.(\w+)/g,
  /formData\.(\w+)\.(\w+)/g,
  /profile\.(\w+)\.(\w+)/g,
  /user\.(\w+)\.(\w+)/g,
];

// Safe patterns to exclude from warnings
const SAFE_PATTERNS = [
  /(\w+)\s*&&\s*(\w+)\.map\(/g,  // Already has null check
  /(\w+)\?\.\w+/g,               // Optional chaining
  /(\w+)\s*\|\|\s*\[\]/g,        // Default empty array
  /(\w+)\s*\?\s*(\w+)\.map\(/g,  // Ternary check
];

class RuntimeErrorAuditor {
  constructor() {
    this.issues = [];
    this.scannedFiles = 0;
    this.totalIssues = 0;
  }

  scanDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath);
    
    entries.forEach(entry => {
      const fullPath = path.join(dirPath, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !this.shouldSkipDirectory(entry)) {
        this.scanDirectory(fullPath);
      } else if (this.shouldScanFile(entry)) {
        this.scanFile(fullPath);
      }
    });
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = ['node_modules', '.git', '.next', 'dist', 'build', 'coverage'];
    return skipDirs.includes(dirName);
  }

  shouldScanFile(fileName) {
    return fileName.endsWith('.tsx') || fileName.endsWith('.ts') || fileName.endsWith('.jsx') || fileName.endsWith('.js');
  }

  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.scannedFiles++;
      
      const lines = content.split('\n');
      
      lines.forEach((line, lineIndex) => {
        this.scanLine(line, lineIndex + 1, filePath);
      });
      
    } catch (error) {
      console.log(`Error scanning ${filePath}: ${error.message}`);
    }
  }

  scanLine(line, lineNumber, filePath) {
    // Skip comments and import statements
    if (line.trim().startsWith('//') || 
        line.trim().startsWith('/*') || 
        line.trim().startsWith('import') ||
        line.trim().startsWith('export')) {
      return;
    }

    // Check if line already has safe patterns
    const hasSafePattern = SAFE_PATTERNS.some(pattern => pattern.test(line));
    if (hasSafePattern) {
      return;
    }

    // Check for runtime error patterns
    RUNTIME_ERROR_PATTERNS.forEach(pattern => {
      const matches = line.matchAll(pattern);
      
      for (const match of matches) {
        const issue = {
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          pattern: pattern.source,
          variable: match[1],
          severity: this.calculateSeverity(pattern, line),
          suggestion: this.generateSuggestion(pattern, match[1], line)
        };
        
        this.issues.push(issue);
        this.totalIssues++;
      }
    });
  }

  calculateSeverity(pattern, line) {
    // High severity for common array methods without checks
    if (pattern.source.includes('.map(') || 
        pattern.source.includes('.filter(') || 
        pattern.source.includes('.length')) {
      return 'HIGH';
    }
    
    // Medium severity for object property access
    if (pattern.source.includes('\\.\\w+\\.\\w+')) {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  generateSuggestion(pattern, variable, line) {
    if (pattern.source.includes('.map(')) {
      return `Add null check: ${variable} && ${variable}.length > 0 ? ${variable}.map(...) : []`;
    }
    
    if (pattern.source.includes('.length')) {
      return `Add null check: ${variable}?.length || 0`;
    }
    
    if (pattern.source.includes('\\.\\w+\\.\\w+')) {
      return `Use optional chaining: ${variable}?.property?.subProperty`;
    }
    
    if (pattern.source.includes('.join(')) {
      return `Add null check: ${variable} && ${variable}.join(...) || ''`;
    }
    
    return 'Add appropriate null/undefined checks';
  }

  generateReport() {
    console.log('\n🔍 RUNTIME ERROR AUDIT REPORT');
    console.log('===============================================');
    console.log(`📁 Files Scanned: ${this.scannedFiles}`);
    console.log(`⚠️  Total Issues Found: ${this.totalIssues}`);
    console.log(`🔥 High Severity: ${this.issues.filter(i => i.severity === 'HIGH').length}`);
    console.log(`🟠 Medium Severity: ${this.issues.filter(i => i.severity === 'MEDIUM').length}`);
    console.log(`🟡 Low Severity: ${this.issues.filter(i => i.severity === 'LOW').length}`);
    console.log('===============================================\n');

    // Group issues by file
    const issuesByFile = this.issues.reduce((acc, issue) => {
      if (!acc[issue.file]) {
        acc[issue.file] = [];
      }
      acc[issue.file].push(issue);
      return acc;
    }, {});

    // Report high severity issues first
    const highSeverityFiles = Object.keys(issuesByFile).filter(file => 
      issuesByFile[file].some(issue => issue.severity === 'HIGH')
    );

    if (highSeverityFiles.length > 0) {
      console.log('🔥 HIGH SEVERITY ISSUES (Likely to cause runtime errors):');
      console.log('─'.repeat(60));
      
      highSeverityFiles.forEach(file => {
        console.log(`\n📄 ${file.replace(process.cwd(), '')}`);
        
        const highIssues = issuesByFile[file].filter(issue => issue.severity === 'HIGH');
        highIssues.forEach(issue => {
          console.log(`   Line ${issue.line}: ${issue.code}`);
          console.log(`   Variable: ${issue.variable}`);
          console.log(`   💡 ${issue.suggestion}`);
          console.log('');
        });
      });
    }

    // Summary of most common issues
    const commonVariables = this.issues.reduce((acc, issue) => {
      acc[issue.variable] = (acc[issue.variable] || 0) + 1;
      return acc;
    }, {});

    const topVariables = Object.entries(commonVariables)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    if (topVariables.length > 0) {
      console.log('\n📊 MOST PROBLEMATIC VARIABLES:');
      console.log('─'.repeat(40));
      topVariables.forEach(([variable, count]) => {
        console.log(`${variable}: ${count} potential issues`);
      });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDED FIXES:');
    console.log('─'.repeat(40));
    console.log('1. Add null checks before calling array methods');
    console.log('2. Use optional chaining (?.) for object property access');
    console.log('3. Provide default values using || or ?? operators');
    console.log('4. Initialize state/props with safe defaults');
    console.log('5. Add proper TypeScript interfaces and validation');
    
    return this.issues;
  }

  // Export issues to JSON for further processing
  exportToJson(outputPath = 'runtime-errors.json') {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        filesScanned: this.scannedFiles,
        totalIssues: this.totalIssues,
        highSeverity: this.issues.filter(i => i.severity === 'HIGH').length,
        mediumSeverity: this.issues.filter(i => i.severity === 'MEDIUM').length,
        lowSeverity: this.issues.filter(i => i.severity === 'LOW').length
      },
      issues: this.issues
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📋 Detailed report exported to: ${outputPath}`);
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new RuntimeErrorAuditor();
  
  // Scan frontend source code
  const frontendPath = path.join(__dirname, 'src', 'frontend', 'src');
  
  if (fs.existsSync(frontendPath)) {
    console.log('🔍 Starting Runtime Error Audit...');
    console.log(`📁 Scanning: ${frontendPath}`);
    
    auditor.scanDirectory(frontendPath);
    const issues = auditor.generateReport();
    auditor.exportToJson();
    
    // Exit with error code if high severity issues found
    const highSeverityCount = issues.filter(i => i.severity === 'HIGH').length;
    if (highSeverityCount > 0) {
      console.log(`\n❌ Found ${highSeverityCount} high severity issues that need immediate attention!`);
      process.exit(1);
    } else {
      console.log(`\n✅ No high severity runtime error patterns detected!`);
      process.exit(0);
    }
  } else {
    console.log(`❌ Frontend source directory not found: ${frontendPath}`);
    process.exit(1);
  }
}

module.exports = RuntimeErrorAuditor;
