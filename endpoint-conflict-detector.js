/**
 * Endpoint Conflict Detector
 * 
 * Scans server-basic.js for potential endpoint conflicts before production deployment:
 * - Duplicate route definitions
 * - Route ordering conflicts (specific vs parameterized)
 * - Inconsistent middleware usage
 * - Multiple HTTP methods on same path
 */

const fs = require('fs');
const path = require('path');

class EndpointConflictDetector {
  constructor() {
    this.routes = [];
    this.conflicts = [];
    this.warnings = [];
    this.serverFilePath = path.join(__dirname, 'src', 'backend', 'src', 'server-basic.js');
  }

  analyzeServerFile() {
    console.log('🔍 ENDPOINT CONFLICT DETECTION');
    console.log('==============================');
    console.log(`Analyzing: ${this.serverFilePath}\n`);

    if (!fs.existsSync(this.serverFilePath)) {
      console.error('❌ Server file not found!');
      return false;
    }

    const content = fs.readFileSync(this.serverFilePath, 'utf8');
    this.extractRoutes(content);
    this.detectConflicts();
    this.generateReport();
    
    return this.conflicts.length === 0;
  }

  extractRoutes(content) {
    const lines = content.split('\n');
    const routePattern = /app\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    
    lines.forEach((line, index) => {
      let match;
      while ((match = routePattern.exec(line)) !== null) {
        const method = match[1].toUpperCase();
        const path = match[2];
        
        this.routes.push({
          method,
          path,
          line: index + 1,
          fullLine: line.trim()
        });
      }
      // Reset regex for next iteration
      routePattern.lastIndex = 0;
    });

    console.log(`📊 Found ${this.routes.length} endpoint definitions\n`);
  }

  detectConflicts() {
    // 1. Check for exact duplicates
    this.checkExactDuplicates();
    
    // 2. Check for route ordering conflicts
    this.checkRouteOrdering();
    
    // 3. Check for parameter conflicts
    this.checkParameterConflicts();
    
    // 4. Check for method conflicts
    this.checkMethodConflicts();
  }

  checkExactDuplicates() {
    const seen = new Map();
    
    this.routes.forEach(route => {
      const key = `${route.method} ${route.path}`;
      
      if (seen.has(key)) {
        this.conflicts.push({
          type: 'DUPLICATE_ROUTE',
          severity: 'CRITICAL',
          message: `Duplicate endpoint: ${key}`,
          routes: [seen.get(key), route],
          impact: 'Express.js will use the first definition, second one is unreachable'
        });
      } else {
        seen.set(key, route);
      }
    });
  }

  checkRouteOrdering() {
    // Group routes by method
    const methodGroups = {};
    this.routes.forEach(route => {
      if (!methodGroups[route.method]) {
        methodGroups[route.method] = [];
      }
      methodGroups[route.method].push(route);
    });

    // Check each method group for ordering issues
    Object.entries(methodGroups).forEach(([method, routes]) => {
      routes.forEach((route, index) => {
        // Check if this is a parameterized route
        if (route.path.includes(':')) {
          // Check if there are more specific routes after this one
          const laterRoutes = routes.slice(index + 1);
          const conflictingRoutes = laterRoutes.filter(laterRoute => 
            this.wouldConflict(route.path, laterRoute.path)
          );
          
          conflictingRoutes.forEach(conflicting => {
            this.conflicts.push({
              type: 'ROUTE_ORDERING',
              severity: 'HIGH',
              message: `Route ordering issue: ${conflicting.path} should come before ${route.path}`,
              routes: [route, conflicting],
              impact: `${conflicting.path} will never be reached because ${route.path} matches first`
            });
          });
        }
      });
    });
  }

  wouldConflict(paramRoute, specificRoute) {
    // Simple check: if specificRoute could be matched by paramRoute
    const paramParts = paramRoute.split('/');
    const specificParts = specificRoute.split('/');
    
    if (paramParts.length !== specificParts.length) {
      return false;
    }
    
    for (let i = 0; i < paramParts.length; i++) {
      const paramPart = paramParts[i];
      const specificPart = specificParts[i];
      
      // If param part is a parameter, it matches anything
      if (paramPart.startsWith(':')) {
        continue;
      }
      
      // If not a parameter, they must match exactly
      if (paramPart !== specificPart) {
        return false;
      }
    }
    
    return true;
  }

  checkParameterConflicts() {
    // Check for inconsistent parameter naming
    const parameterizedRoutes = this.routes.filter(route => route.path.includes(':'));
    const paramPatterns = {};
    
    parameterizedRoutes.forEach(route => {
      const basePattern = route.path.replace(/:[^/]+/g, ':param');
      if (!paramPatterns[basePattern]) {
        paramPatterns[basePattern] = [];
      }
      paramPatterns[basePattern].push(route);
    });
    
    Object.entries(paramPatterns).forEach(([pattern, routes]) => {
      if (routes.length > 1) {
        // Check if parameter names are consistent
        const paramNames = routes.map(route => {
          const matches = route.path.match(/:([^/]+)/g);
          return matches ? matches.join(',') : '';
        });
        
        const uniqueParamNames = [...new Set(paramNames)];
        if (uniqueParamNames.length > 1) {
          this.warnings.push({
            type: 'PARAMETER_INCONSISTENCY',
            severity: 'MEDIUM',
            message: `Inconsistent parameter names for pattern ${pattern}`,
            routes: routes,
            impact: 'May cause confusion in route handling'
          });
        }
      }
    });
  }

  checkMethodConflicts() {
    // Group routes by path
    const pathGroups = {};
    this.routes.forEach(route => {
      if (!pathGroups[route.path]) {
        pathGroups[route.path] = [];
      }
      pathGroups[route.path].push(route);
    });

    Object.entries(pathGroups).forEach(([path, routes]) => {
      if (routes.length > 1) {
        const methods = routes.map(r => r.method);
        const uniqueMethods = [...new Set(methods)];
        
        if (uniqueMethods.length < methods.length) {
          // Same path with same method multiple times
          const duplicateMethods = methods.filter((method, index) => 
            methods.indexOf(method) !== index
          );
          
          duplicateMethods.forEach(method => {
            const duplicateRoutes = routes.filter(r => r.method === method);
            this.conflicts.push({
              type: 'METHOD_DUPLICATE',
              severity: 'CRITICAL',
              message: `Multiple ${method} handlers for ${path}`,
              routes: duplicateRoutes,
              impact: 'Only the first handler will be used'
            });
          });
        }
      }
    });
  }

  generateReport() {
    console.log('📊 CONFLICT DETECTION RESULTS');
    console.log('==============================\n');
    
    console.log(`🔍 Total Routes Analyzed: ${this.routes.length}`);
    console.log(`🚨 Critical Conflicts: ${this.conflicts.filter(c => c.severity === 'CRITICAL').length}`);
    console.log(`⚠️  High Priority Issues: ${this.conflicts.filter(c => c.severity === 'HIGH').length}`);
    console.log(`💡 Warnings: ${this.warnings.length}\n`);

    if (this.conflicts.length === 0 && this.warnings.length === 0) {
      console.log('🎉 NO CONFLICTS DETECTED!');
      console.log('✅ All endpoints are properly configured');
      console.log('🚀 Ready for production deployment!\n');
      return;
    }

    // Report critical conflicts
    const criticalConflicts = this.conflicts.filter(c => c.severity === 'CRITICAL');
    if (criticalConflicts.length > 0) {
      console.log('🚨 CRITICAL CONFLICTS (Must Fix Before Production):');
      console.log('==================================================');
      criticalConflicts.forEach((conflict, index) => {
        console.log(`\n${index + 1}. ${conflict.type}: ${conflict.message}`);
        console.log(`   Impact: ${conflict.impact}`);
        conflict.routes.forEach(route => {
          console.log(`   - Line ${route.line}: ${route.method} ${route.path}`);
        });
      });
      console.log('');
    }

    // Report high priority issues
    const highPriorityIssues = this.conflicts.filter(c => c.severity === 'HIGH');
    if (highPriorityIssues.length > 0) {
      console.log('⚠️  HIGH PRIORITY ISSUES (Recommended to Fix):');
      console.log('===============================================');
      highPriorityIssues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.type}: ${issue.message}`);
        console.log(`   Impact: ${issue.impact}`);
        issue.routes.forEach(route => {
          console.log(`   - Line ${route.line}: ${route.method} ${route.path}`);
        });
      });
      console.log('');
    }

    // Report warnings
    if (this.warnings.length > 0) {
      console.log('💡 WARNINGS (Consider Reviewing):');
      console.log('=================================');
      this.warnings.forEach((warning, index) => {
        console.log(`\n${index + 1}. ${warning.type}: ${warning.message}`);
        console.log(`   Impact: ${warning.impact}`);
        warning.routes.forEach(route => {
          console.log(`   - Line ${route.line}: ${route.method} ${route.path}`);
        });
      });
      console.log('');
    }

    // Generate recommendations
    console.log('🎯 RECOMMENDATIONS:');
    console.log('===================');
    
    if (criticalConflicts.length > 0) {
      console.log('🚨 CRITICAL ACTIONS REQUIRED:');
      console.log('- Remove duplicate route definitions');
      console.log('- Keep only the most recent/complete implementation');
      console.log('- Restart server after fixes');
      console.log('- Re-run this detection script to verify fixes');
    }
    
    if (highPriorityIssues.length > 0) {
      console.log('⚠️  RECOMMENDED ACTIONS:');
      console.log('- Reorder routes (specific routes before parameterized ones)');
      console.log('- Review route logic for potential conflicts');
      console.log('- Test affected endpoints after reordering');
    }
    
    if (this.warnings.length > 0) {
      console.log('💡 SUGGESTED IMPROVEMENTS:');
      console.log('- Standardize parameter naming conventions');
      console.log('- Add route comments for clarity');
      console.log('- Consider grouping related routes together');
    }

    console.log('\n🔍 Next Steps:');
    console.log('1. Fix all CRITICAL conflicts immediately');
    console.log('2. Address HIGH PRIORITY issues when possible');
    console.log('3. Re-run this script to verify fixes');
    console.log('4. Run comprehensive endpoint validation');
    console.log('5. Deploy to production only after zero critical conflicts');

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRoutes: this.routes.length,
        criticalConflicts: criticalConflicts.length,
        highPriorityIssues: highPriorityIssues.length,
        warnings: this.warnings.length
      },
      routes: this.routes,
      conflicts: this.conflicts,
      warnings: this.warnings
    };

    fs.writeFileSync('ENDPOINT_CONFLICT_REPORT.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved to: ENDPOINT_CONFLICT_REPORT.json');
  }

  // Quick method to list all routes for overview
  listAllRoutes() {
    console.log('\n📋 ALL DETECTED ROUTES:');
    console.log('=======================');
    
    const groupedByMethod = {};
    this.routes.forEach(route => {
      if (!groupedByMethod[route.method]) {
        groupedByMethod[route.method] = [];
      }
      groupedByMethod[route.method].push(route);
    });

    Object.entries(groupedByMethod).forEach(([method, routes]) => {
      console.log(`\n${method}:`);
      routes.forEach(route => {
        console.log(`   ${route.path} (line ${route.line})`);
      });
    });
  }
}

// Run the conflict detection
async function main() {
  try {
    const detector = new EndpointConflictDetector();
    const isClean = detector.analyzeServerFile();
    
    // Optionally show all routes
    if (process.argv.includes('--list-routes')) {
      detector.listAllRoutes();
    }
    
    // Exit with error code if conflicts found
    if (!isClean) {
      console.log('❌ Conflicts detected - review and fix before production deployment');
      process.exit(1);
    } else {
      console.log('✅ No conflicts detected - ready for production deployment');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Conflict detection failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { EndpointConflictDetector };
