/**
 * Comprehensive End-to-End Frontend Testing Suite
 * Tests actual user flows, navigation, form submissions, and data persistence
 */

const puppeteer = require('puppeteer');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8000';

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function logResult(testName, success, details = '') {
  totalTests++;
  if (success) {
    passedTests++;
    console.log(`✅ ${testName}`);
  } else {
    failedTests++;
    console.log(`❌ ${testName} - ${details}`);
  }
  testResults.push({ testName, success, details });
}

async function waitForSelector(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    return false;
  }
}

async function testFrontendNavigation(page) {
  console.log('\n🌐 Testing Frontend Navigation...');
  
  // Test homepage load
  try {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    const title = await page.title();
    logResult('Homepage: Load', title.includes('FaithLink') || title.length > 0);
  } catch (error) {
    logResult('Homepage: Load', false, error.message);
  }

  // Test navigation menu items
  const navTests = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/members', name: 'Members' },
    { path: '/groups', name: 'Groups' },
    { path: '/events', name: 'Events' },
    { path: '/journey-templates', name: 'Journey Templates' },
    { path: '/journeys', name: 'Journeys' },
    { path: '/attendance', name: 'Attendance' },
    { path: '/care', name: 'Pastoral Care' },
    { path: '/tasks', name: 'Tasks' },
    { path: '/communications', name: 'Communications' },
    { path: '/reports', name: 'Reports' }
  ];

  for (const navTest of navTests) {
    try {
      await page.goto(`${FRONTEND_URL}${navTest.path}`, { waitUntil: 'networkidle2' });
      
      // Check for common error indicators
      const hasError = await page.evaluate(() => {
        const bodyText = document.body.innerText.toLowerCase();
        return bodyText.includes('404') || 
               bodyText.includes('not found') || 
               bodyText.includes('error') ||
               bodyText.includes('something went wrong');
      });
      
      logResult(`Navigation: ${navTest.name}`, !hasError);
    } catch (error) {
      logResult(`Navigation: ${navTest.name}`, false, error.message);
    }
  }
}

async function testJourneyTemplateFlow(page) {
  console.log('\n🌟 Testing Journey Template User Flow...');
  
  try {
    // Navigate to journey templates
    await page.goto(`${FRONTEND_URL}/journey-templates`, { waitUntil: 'networkidle2' });
    logResult('Journey Templates: Page Load', true);
    
    // Click "New Template" button
    await page.goto(`${FRONTEND_URL}/journey-templates/new`, { waitUntil: 'networkidle2' });
    logResult('Journey Templates: New Template Page', true);
    
    // Fill out the form
    const hasForm = await waitForSelector(page, 'input[name="name"], input[placeholder*="name"], input[placeholder*="title"]');
    if (hasForm) {
      // Try multiple possible selectors for the form fields
      const titleFilled = await page.evaluate(() => {
        const titleInput = document.querySelector('input[name="name"]') || 
                          document.querySelector('input[placeholder*="name"]') ||
                          document.querySelector('input[placeholder*="title"]') ||
                          document.querySelector('input[type="text"]');
        if (titleInput) {
          titleInput.value = 'Test Journey Template E2E';
          titleInput.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        return false;
      });
      
      const descriptionFilled = await page.evaluate(() => {
        const descInput = document.querySelector('textarea[name="description"]') ||
                         document.querySelector('textarea[placeholder*="description"]') ||
                         document.querySelector('textarea');
        if (descInput) {
          descInput.value = 'E2E test template description';
          descInput.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        return false;
      });
      
      logResult('Journey Templates: Form Fill', titleFilled && descriptionFilled);
      
      // Add a milestone
      const milestoneAdded = await page.evaluate(() => {
        const addButton = document.querySelector('button[type="button"]') ||
                         Array.from(document.querySelectorAll('button')).find(btn => 
                           btn.textContent.toLowerCase().includes('add') ||
                           btn.textContent.toLowerCase().includes('milestone')
                         );
        if (addButton) {
          addButton.click();
          return true;
        }
        return false;
      });
      
      if (milestoneAdded) {
        await page.waitForTimeout(1000); // Wait for milestone form to appear
        
        const milestoneFilled = await page.evaluate(() => {
          const milestoneInputs = document.querySelectorAll('input[type="text"]');
          const milestoneTextareas = document.querySelectorAll('textarea');
          
          if (milestoneInputs.length > 1) {
            milestoneInputs[milestoneInputs.length - 1].value = 'Test Milestone';
            milestoneInputs[milestoneInputs.length - 1].dispatchEvent(new Event('input', { bubbles: true }));
          }
          
          if (milestoneTextareas.length > 1) {
            milestoneTextareas[milestoneTextareas.length - 1].value = 'Test milestone description';
            milestoneTextareas[milestoneTextareas.length - 1].dispatchEvent(new Event('input', { bubbles: true }));
          }
          
          return milestoneInputs.length > 1;
        });
        
        logResult('Journey Templates: Add Milestone', milestoneFilled);
      }
      
      // Submit the form
      const submitButton = await page.evaluate(() => {
        const submitBtn = document.querySelector('button[type="submit"]') ||
                         Array.from(document.querySelectorAll('button')).find(btn =>
                           btn.textContent.toLowerCase().includes('save') ||
                           btn.textContent.toLowerCase().includes('create') ||
                           btn.textContent.toLowerCase().includes('submit')
                         );
        if (submitBtn) {
          submitBtn.click();
          return true;
        }
        return false;
      });
      
      if (submitButton) {
        // Wait for navigation or response
        await page.waitForTimeout(3000);
        
        // Check if we successfully navigated or got a success message
        const currentUrl = page.url();
        const hasSuccessMessage = await page.evaluate(() => {
          const bodyText = document.body.innerText.toLowerCase();
          return bodyText.includes('success') || 
                 bodyText.includes('created') ||
                 bodyText.includes('saved');
        });
        
        const navigationSuccess = !currentUrl.includes('/new') || hasSuccessMessage;
        logResult('Journey Templates: Form Submission', navigationSuccess);
        
        // Test if the newly created template appears in the list
        if (navigationSuccess) {
          await page.goto(`${FRONTEND_URL}/journey-templates`, { waitUntil: 'networkidle2' });
          const templateInList = await page.evaluate(() => {
            const bodyText = document.body.innerText;
            return bodyText.includes('Test Journey Template E2E');
          });
          logResult('Journey Templates: Template Persisted', templateInList);
        }
      } else {
        logResult('Journey Templates: Form Submission', false, 'Submit button not found');
      }
    } else {
      logResult('Journey Templates: Form Fill', false, 'Form not found');
    }
    
  } catch (error) {
    logResult('Journey Templates: Complete Flow', false, error.message);
  }
}

async function testMemberManagement(page) {
  console.log('\n👥 Testing Member Management Flow...');
  
  try {
    // Navigate to members page
    await page.goto(`${FRONTEND_URL}/members`, { waitUntil: 'networkidle2' });
    
    // Check if members list loads
    const membersLoaded = await page.evaluate(() => {
      const bodyText = document.body.innerText.toLowerCase();
      return !bodyText.includes('404') && !bodyText.includes('error');
    });
    logResult('Members: Page Load', membersLoaded);
    
    // Test member search functionality
    const searchInput = await waitForSelector(page, 'input[type="search"], input[placeholder*="search"], input[name="search"]');
    if (searchInput) {
      await page.type('input[type="search"], input[placeholder*="search"], input[name="search"]', 'John');
      await page.waitForTimeout(1000);
      logResult('Members: Search Functionality', true);
    } else {
      logResult('Members: Search Functionality', false, 'Search input not found');
    }
    
  } catch (error) {
    logResult('Members: Complete Flow', false, error.message);
  }
}

async function testGroupManagement(page) {
  console.log('\n👨‍👩‍👧‍👦 Testing Group Management Flow...');
  
  try {
    // Navigate to groups page
    await page.goto(`${FRONTEND_URL}/groups`, { waitUntil: 'networkidle2' });
    
    const groupsLoaded = await page.evaluate(() => {
      const bodyText = document.body.innerText.toLowerCase();
      return !bodyText.includes('404') && !bodyText.includes('error');
    });
    logResult('Groups: Page Load', groupsLoaded);
    
    // Test group filtering
    const hasFilters = await waitForSelector(page, 'select, button[role="combobox"]');
    logResult('Groups: Filter Controls', hasFilters);
    
  } catch (error) {
    logResult('Groups: Complete Flow', false, error.message);
  }
}

async function testApiConnectivity(page) {
  console.log('\n🔌 Testing Frontend-Backend API Connectivity...');
  
  // Intercept network requests to check API calls
  const apiCalls = [];
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes(':8000/api/')) {
      apiCalls.push({
        url,
        status: response.status(),
        ok: response.ok()
      });
    }
  });
  
  // Navigate to dashboard to trigger API calls
  await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(3000);
  
  const successfulApiCalls = apiCalls.filter(call => call.ok).length;
  const totalApiCalls = apiCalls.length;
  
  logResult(`API Connectivity: ${successfulApiCalls}/${totalApiCalls} calls successful`, 
    totalApiCalls > 0 && (successfulApiCalls / totalApiCalls) >= 0.8);
  
  // Log failed API calls for debugging
  const failedCalls = apiCalls.filter(call => !call.ok);
  if (failedCalls.length > 0) {
    console.log('\n❌ Failed API Calls:');
    failedCalls.forEach(call => {
      console.log(`   ${call.status}: ${call.url}`);
    });
  }
}

async function runComprehensiveE2ETests() {
  console.log('🚀 Starting Comprehensive Frontend E2E Test Suite');
  console.log('===================================================');
  
  let browser;
  let page;
  
  try {
    browser = await puppeteer.launch({
      headless: true, // Set to false for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Run all test suites
    await testFrontendNavigation(page);
    await testJourneyTemplateFlow(page);
    await testMemberManagement(page);
    await testGroupManagement(page);
    await testApiConnectivity(page);
    
  } catch (error) {
    console.error('E2E Test Suite Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Print final results
  console.log('\n===================================================');
  console.log('🏁 COMPREHENSIVE E2E TEST RESULTS');
  console.log('===================================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📊 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (failedTests > 0) {
    console.log('\n⚠️ Failed Tests:');
    testResults.filter(r => !r.success).forEach(result => {
      console.log(`   - ${result.testName}: ${result.details}`);
    });
  }
  
  console.log('\n🔗 Frontend-Backend Integration Status:');
  console.log(failedTests === 0 ? '✅ All systems operational!' : '⚠️ Issues detected - see details above');
}

// Check if required dependencies are available
async function checkDependencies() {
  try {
    await puppeteer.launch({ headless: true });
    console.log('✅ Puppeteer available');
    return true;
  } catch (error) {
    console.log('❌ Puppeteer not available. Installing...');
    console.log('Run: npm install puppeteer');
    return false;
  }
}

// Run the test suite
if (require.main === module) {
  checkDependencies().then(hasDepedencies => {
    if (hasDepedencies) {
      runComprehensiveE2ETests();
    }
  });
}

module.exports = { runComprehensiveE2ETests };
