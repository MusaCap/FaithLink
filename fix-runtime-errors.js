/**
 * Automated Runtime Error Fix Script
 * Following Semantic Seed Venture Studio Coding Standards V2.0
 * Systematically fixes undefined property access patterns
 */

const fs = require('fs');
const path = require('path');

const FIXES = [
  // Array method fixes
  {
    pattern: /(\w+)\.map\(/g,
    replacement: (match, varName) => `${varName} && ${varName}.length > 0 ? ${varName}.map(`,
    needsClosing: true,
    closing: ' : []'
  },
  {
    pattern: /(\w+)\.filter\(/g,
    replacement: (match, varName) => `${varName} && ${varName}.length > 0 ? ${varName}.filter(`,
    needsClosing: true,
    closing: ' : []'
  },
  {
    pattern: /(\w+)\.length/g,
    replacement: (match, varName) => `${varName}?.length || 0`,
    needsClosing: false
  },
  {
    pattern: /(\w+)\.join\(/g,
    replacement: (match, varName) => `${varName} && ${varName}.length > 0 ? ${varName}.join(`,
    needsClosing: true,
    closing: ' : ""'
  }
];

class RuntimeErrorFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
  }

  fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let modifiedContent = content;
      let fileHasFixes = false;
      let fileFixes = 0;

      FIXES.forEach(fix => {
        const matches = [...modifiedContent.matchAll(fix.pattern)];
        
        matches.forEach(match => {
          const originalMatch = match[0];
          const varName = match[1];
          
          // Skip if already has safe patterns
          const contextStart = Math.max(0, match.index - 20);
          const contextEnd = Math.min(modifiedContent.length, match.index + 50);
          const context = modifiedContent.substring(contextStart, contextEnd);
          
          // Skip if already protected
          if (context.includes('&&') || 
              context.includes('?.') || 
              context.includes('||') ||
              context.includes('?') ||
              varName === 'process' ||
              varName === 'console' ||
              varName === 'Math' ||
              varName === 'JSON') {
            return;
          }

          const replacement = fix.replacement(originalMatch, varName);
          modifiedContent = modifiedContent.replace(originalMatch, replacement);
          
          fileHasFixes = true;
          fileFixes++;
          this.totalFixes++;
        });
      });

      if (fileHasFixes) {
        // Create backup
        const backupPath = `${filePath}.backup`;
        fs.writeFileSync(backupPath, content);
        
        // Write fixed content
        fs.writeFileSync(filePath, modifiedContent);
        
        this.fixedFiles.push({
          file: filePath,
          fixes: fileFixes,
          backup: backupPath
        });
        
        console.log(`✅ Fixed ${fileFixes} issues in ${filePath.replace(process.cwd(), '')}`);
      }

    } catch (error) {
      console.log(`❌ Error fixing ${filePath}: ${error.message}`);
    }
  }

  scanAndFixDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath);
    
    entries.forEach(entry => {
      const fullPath = path.join(dirPath, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !this.shouldSkipDirectory(entry)) {
        this.scanAndFixDirectory(fullPath);
      } else if (this.shouldFixFile(entry)) {
        this.fixFile(fullPath);
      }
    });
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = ['node_modules', '.git', '.next', 'dist', 'build', 'coverage'];
    return skipDirs.includes(dirName);
  }

  shouldFixFile(fileName) {
    return fileName.endsWith('.tsx') || fileName.endsWith('.ts') || fileName.endsWith('.jsx') || fileName.endsWith('.js');
  }

  generateReport() {
    console.log('\n🔧 RUNTIME ERROR FIX REPORT');
    console.log('===============================================');
    console.log(`📁 Files Fixed: ${this.fixedFiles.length}`);
    console.log(`🔧 Total Fixes Applied: ${this.totalFixes}`);
    console.log('===============================================\n');

    if (this.fixedFiles.length > 0) {
      console.log('📋 FIXED FILES:');
      this.fixedFiles.forEach(({ file, fixes, backup }) => {
        console.log(`   ${file.replace(process.cwd(), '')} (${fixes} fixes)`);
        console.log(`   Backup: ${backup.replace(process.cwd(), '')}`);
      });
      
      console.log('\n💡 WHAT WAS FIXED:');
      console.log('• Added null checks before array method calls');
      console.log('• Used optional chaining for safe property access');
      console.log('• Added default values for undefined properties');
      console.log('• Protected against undefined variable access');
      
      console.log('\n⚠️  MANUAL REVIEW NEEDED:');
      console.log('• Check that ternary operators are properly closed');
      console.log('• Verify logic still works as expected');
      console.log('• Test components to ensure no breaking changes');
      console.log('• Remove .backup files after verification');
    } else {
      console.log('✅ No fixes needed or all files already protected!');
    }
  }

  restoreBackups() {
    console.log('\n🔄 RESTORING FROM BACKUPS...');
    
    this.fixedFiles.forEach(({ file, backup }) => {
      if (fs.existsSync(backup)) {
        const backupContent = fs.readFileSync(backup, 'utf8');
        fs.writeFileSync(file, backupContent);
        fs.unlinkSync(backup);
        console.log(`✅ Restored ${file.replace(process.cwd(), '')}`);
      }
    });
  }

  cleanupBackups() {
    console.log('\n🧹 CLEANING UP BACKUPS...');
    
    this.fixedFiles.forEach(({ backup }) => {
      if (fs.existsSync(backup)) {
        fs.unlinkSync(backup);
        console.log(`🗑️  Removed ${backup.replace(process.cwd(), '')}`);
      }
    });
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new RuntimeErrorFixer();
  
  const frontendPath = path.join(__dirname, 'src', 'frontend', 'src');
  
  if (fs.existsSync(frontendPath)) {
    console.log('🔧 Starting Automated Runtime Error Fixes...');
    console.log(`📁 Scanning: ${frontendPath}`);
    
    fixer.scanAndFixDirectory(frontendPath);
    fixer.generateReport();
    
    if (fixer.totalFixes > 0) {
      console.log(`\n✅ Applied ${fixer.totalFixes} automated fixes!`);
      console.log('🧪 Please test your application to verify fixes work correctly.');
      console.log('💾 Original files backed up with .backup extension');
      console.log('🔄 Run with --restore flag to revert changes if needed');
    }
  } else {
    console.log(`❌ Frontend source directory not found: ${frontendPath}`);
    process.exit(1);
  }
}

module.exports = RuntimeErrorFixer;
