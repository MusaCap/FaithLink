const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Frontend-to-Backend API Mapping Analysis
 * Scans ALL frontend pages, components, and services to identify EVERY API call
 */

class FrontendAPIAnalyzer {
  constructor() {
    this.apiCalls = new Set();
    this.routePatterns = new Set();
    this.serviceFiles = [];
    this.pageFiles = [];
    this.componentFiles = [];
    this.results = {
      totalFiles: 0,
      apiEndpoints: [],
      frontendRoutes: [],
      missingEndpoints: [],
      byModule: {}
    };
  }

  // Extract API calls from file content
  extractAPICalls(content, filename) {
    const calls = [];
    
    // Common API call patterns
    const patterns = [
      // Fetch calls
      /fetch\s*\(\s*[`'"](.*?)[`'"]/g,
      /fetch\s*\(\s*`([^`]*)`/g,
      
      // Service method calls with URLs
      /['"](\/api\/[^'"]*)['"]/g,
      
      // Template literals with API paths
      /`(\/api\/[^`]*)`/g,
      
      // Direct API endpoint references
      /NEXT_PUBLIC_API_URL.*?['"](\/api\/[^'"]*)['"]/g,
      
      // Router.push calls
      /router\.push\s*\(\s*[`'"](\/[^`'"]*)[`'"]/g,
      /Router\.push\s*\(\s*[`'"](\/[^`'"]*)[`'"]/g,
      
      // Link href attributes
      /href\s*=\s*[`'"](\/[^`'"]*)[`'"]/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const endpoint = match[1];
        if (endpoint && endpoint.startsWith('/')) {
          calls.push({
            endpoint,
            file: filename,
            type: endpoint.startsWith('/api/') ? 'api' : 'route'
          });
        }
      }
    });

    // Extract method types (GET, POST, PUT, DELETE)
    const methodPattern = /method:\s*['"](GET|POST|PUT|DELETE|PATCH)['"]/g;
    let methodMatch;
    while ((methodMatch = methodPattern.exec(content)) !== null) {
      const lastCall = calls[calls.length - 1];
      if (lastCall) {
        lastCall.method = methodMatch[1];
      }
    }

    return calls;
  }

  // Recursively scan directory for files
  scanDirectory(dirPath, extensions = ['.tsx', '.ts', '.js']) {
    const files = [];
    
    if (!fs.existsSync(dirPath)) {
      return files;
    }

    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...this.scanDirectory(fullPath, extensions));
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  }

  // Analyze a single file
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      const calls = this.extractAPICalls(content, relativePath);
      
      // Categorize file type
      if (filePath.includes('/services/')) {
        this.serviceFiles.push({ path: relativePath, calls });
      } else if (filePath.includes('/app/') && filePath.endsWith('/page.tsx')) {
        this.pageFiles.push({ path: relativePath, calls });
      } else if (filePath.includes('/components/')) {
        this.componentFiles.push({ path: relativePath, calls });
      }

      calls.forEach(call => {
        if (call.type === 'api') {
          this.apiCalls.add(call.endpoint);
        } else {
          this.routePatterns.add(call.endpoint);
        }
      });

      return calls;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return [];
    }
  }

  // Generate comprehensive API endpoint list from frontend analysis
  generateExpectedEndpoints() {
    const endpoints = [];
    
    // Extract all unique API patterns and generate expected endpoints
    const apiPatterns = Array.from(this.apiCalls);
    
    apiPatterns.forEach(pattern => {
      // Replace dynamic segments with placeholder values
      const endpoint = pattern
        .replace(/\$\{[^}]+\}/g, 'DYNAMIC_ID')
        .replace(/:\w+/g, 'DYNAMIC_ID')
        .replace(/\[id\]/g, 'DYNAMIC_ID');
      
      // Generate common CRUD operations for each base endpoint
      const basePath = endpoint.split('/').slice(0, 3).join('/'); // /api/resource
      
      if (!endpoints.some(e => e.path === basePath)) {
        endpoints.push(
          { path: basePath, method: 'GET', description: `List ${basePath.split('/')[2]}` },
          { path: basePath, method: 'POST', description: `Create ${basePath.split('/')[2]}` }
        );
      }
      
      if (endpoint.includes('DYNAMIC_ID')) {
        const idPath = basePath + '/DYNAMIC_ID';
        if (!endpoints.some(e => e.path === idPath)) {
          endpoints.push(
            { path: idPath, method: 'GET', description: `Get specific ${basePath.split('/')[2]}` },
            { path: idPath, method: 'PUT', description: `Update specific ${basePath.split('/')[2]}` },
            { path: idPath, method: 'DELETE', description: `Delete specific ${basePath.split('/')[2]}` }
          );
        }
      }
      
      // Add the original endpoint as well
      if (!endpoints.some(e => e.path === endpoint)) {
        endpoints.push({ path: endpoint, method: 'GET', description: `Frontend expects: ${endpoint}` });
      }
    });

    return endpoints;
  }

  // Main analysis function
  async analyze() {
    console.log('🔍 COMPREHENSIVE FRONTEND-TO-BACKEND API ANALYSIS\n');
    console.log('Scanning ALL frontend files for API dependencies...\n');

    const frontendDir = path.join(process.cwd(), 'src', 'frontend', 'src');
    const allFiles = this.scanDirectory(frontendDir);
    
    console.log(`📁 Found ${allFiles.length} frontend files to analyze\n`);

    let totalAPICalls = 0;
    const moduleAPIs = {};

    // Analyze each file
    for (const filePath of allFiles) {
      const calls = this.analyzeFile(filePath);
      totalAPICalls += calls.length;
      
      // Group by module
      const module = this.getModuleFromPath(filePath);
      if (!moduleAPIs[module]) {
        moduleAPIs[module] = new Set();
      }
      calls.forEach(call => {
        if (call.type === 'api') {
          moduleAPIs[module].add(call.endpoint);
        }
      });
    }

    // Generate comprehensive endpoint list
    const expectedEndpoints = this.generateExpectedEndpoints();
    
    console.log('📊 ANALYSIS RESULTS:\n');
    console.log(`📄 Total Files Analyzed: ${allFiles.length}`);
    console.log(`📋 Service Files: ${this.serviceFiles.length}`);
    console.log(`📝 Page Files: ${this.pageFiles.length}`);
    console.log(`🧩 Component Files: ${this.componentFiles.length}`);
    console.log(`🔗 Total API Calls Found: ${totalAPICalls}`);
    console.log(`🎯 Unique API Endpoints: ${this.apiCalls.size}`);
    console.log(`📍 Frontend Routes: ${this.routePatterns.size}`);
    console.log(`⚡ Expected Backend Endpoints: ${expectedEndpoints.length}\n`);

    // Print detailed breakdown by module
    console.log('📋 API CALLS BY MODULE:\n');
    Object.entries(moduleAPIs).forEach(([module, apis]) => {
      if (apis.size > 0) {
        console.log(`📁 ${module.toUpperCase()}:`);
        Array.from(apis).sort().forEach(api => {
          console.log(`   ${api}`);
        });
        console.log('');
      }
    });

    // Print all unique API endpoints found
    console.log('🎯 ALL UNIQUE API ENDPOINTS DISCOVERED:\n');
    const sortedAPIs = Array.from(this.apiCalls).sort();
    sortedAPIs.forEach((api, index) => {
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${api}`);
    });

    console.log('\n📍 FRONTEND ROUTES DISCOVERED:\n');
    const sortedRoutes = Array.from(this.routePatterns).sort();
    sortedRoutes.forEach((route, index) => {
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${route}`);
    });

    console.log('\n⚡ COMPREHENSIVE EXPECTED BACKEND ENDPOINTS:\n');
    expectedEndpoints.forEach((endpoint, index) => {
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${endpoint.method.padEnd(6)} ${endpoint.path} - ${endpoint.description}`);
    });

    // Return results for further processing
    this.results = {
      totalFiles: allFiles.length,
      totalAPICalls,
      uniqueAPIs: this.apiCalls.size,
      uniqueRoutes: this.routePatterns.size,
      apiEndpoints: sortedAPIs,
      frontendRoutes: sortedRoutes,
      expectedEndpoints,
      serviceFiles: this.serviceFiles,
      pageFiles: this.pageFiles,
      componentFiles: this.componentFiles,
      moduleAPIs
    };

    return this.results;
  }

  getModuleFromPath(filePath) {
    if (filePath.includes('/services/')) {
      const serviceName = path.basename(filePath, '.ts').replace('Service', '');
      return serviceName;
    } else if (filePath.includes('/app/')) {
      const parts = filePath.split('/app/')[1].split('/');
      return parts[0];
    } else if (filePath.includes('/components/')) {
      const parts = filePath.split('/components/')[1].split('/');
      return parts[0];
    }
    return 'other';
  }
}

// Run the analysis
async function runComprehensiveAnalysis() {
  const analyzer = new FrontendAPIAnalyzer();
  const results = await analyzer.analyze();
  
  // Save results to file for further processing
  fs.writeFileSync('comprehensive-api-analysis-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Results saved to: comprehensive-api-analysis-results.json');
  
  return results;
}

// Execute if run directly
if (require.main === module) {
  runComprehensiveAnalysis().catch(console.error);
}

module.exports = { FrontendAPIAnalyzer, runComprehensiveAnalysis };
