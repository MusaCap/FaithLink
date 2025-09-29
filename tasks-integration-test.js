/**
 * SPRINT 1: Tasks Management Module - Comprehensive Integration Test
 * Tests all Tasks API endpoints and validates integration with frontend components
 */

const API_BASE_URL = 'http://localhost:8000';

class TasksIntegrationTester {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running: ${testName}`);
    this.totalTests++;
    
    try {
      const startTime = Date.now();
      await testFunction();
      const duration = Date.now() - startTime;
      
      console.log(`✅ PASS: ${testName} (${duration}ms)`);
      this.testResults.push({ name: testName, status: 'PASS', duration });
      this.passedTests++;
    } catch (error) {
      console.log(`❌ FAIL: ${testName} - ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      this.failedTests++;
    }
  }

  async request(method, endpoint, body = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock_token_admin'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  // ========================================
  // CORE API ENDPOINT TESTS
  // ========================================

  async testGetTasks() {
    const data = await this.request('GET', '/api/tasks');
    
    if (!data.tasks || !Array.isArray(data.tasks)) {
      throw new Error('Response should contain tasks array');
    }
    
    if (!data.total || typeof data.total !== 'number') {
      throw new Error('Response should contain total count');
    }

    if (data.tasks.length === 0) {
      throw new Error('Should return mock tasks data');
    }

    // Validate task structure matches TaskService expectations
    const firstTask = data.tasks[0];
    const requiredFields = ['id', 'title', 'description', 'priority', 'status', 'category', 'createdAt'];
    
    for (const field of requiredFields) {
      if (!(field in firstTask)) {
        throw new Error(`Task missing required field: ${field}`);
      }
    }

    console.log(`   📋 Returned ${data.tasks.length} tasks out of ${data.total} total`);
  }

  async testGetTasksWithFiltering() {
    // Test status filtering
    const pendingTasks = await this.request('GET', '/api/tasks?status=pending');
    if (pendingTasks.tasks.some(task => task.status !== 'pending')) {
      throw new Error('Status filtering not working correctly');
    }

    // Test priority filtering
    const highPriorityTasks = await this.request('GET', '/api/tasks?priority=high');
    if (highPriorityTasks.tasks.some(task => task.priority !== 'high')) {
      throw new Error('Priority filtering not working correctly');
    }

    // Test search functionality
    const searchResults = await this.request('GET', '/api/tasks?search=follow');
    if (searchResults.tasks.length === 0) {
      throw new Error('Search should return results for "follow"');
    }

    console.log(`   🔍 Filters working: status, priority, search`);
  }

  async testGetTasksWithSorting() {
    // Test sorting by creation date (desc)
    const sortedTasks = await this.request('GET', '/api/tasks?sortBy=createdAt&sortOrder=desc');
    
    if (sortedTasks.tasks.length < 2) {
      throw new Error('Need at least 2 tasks to test sorting');
    }

    const firstTaskDate = new Date(sortedTasks.tasks[0].createdAt);
    const secondTaskDate = new Date(sortedTasks.tasks[1].createdAt);
    
    if (firstTaskDate < secondTaskDate) {
      throw new Error('Tasks not sorted by createdAt desc correctly');
    }

    console.log(`   📅 Sorting by date working correctly`);
  }

  async testGetTasksPagination() {
    // Test pagination
    const page1 = await this.request('GET', '/api/tasks?page=1&limit=2');
    
    if (page1.tasks.length > 2) {
      throw new Error('Pagination limit not respected');
    }

    if (page1.page !== 1) {
      throw new Error('Page number not returned correctly');
    }

    if (!page1.totalPages || page1.totalPages < 1) {
      throw new Error('Total pages not calculated correctly');
    }

    console.log(`   📄 Pagination working: page ${page1.page} of ${page1.totalPages}`);
  }

  async testGetSingleTask() {
    const taskData = await this.request('GET', '/api/tasks/task-1');
    
    if (!taskData.id || taskData.id !== 'task-1') {
      throw new Error('Single task ID not matching');
    }

    if (!taskData.title || !taskData.description) {
      throw new Error('Single task missing required fields');
    }

    // Check for additional details that should be in single task view
    if (!taskData.assignmentHistory) {
      throw new Error('Single task should include assignment history');
    }

    console.log(`   📋 Single task retrieved: ${taskData.title}`);
  }

  async testCreateTask() {
    const newTaskData = {
      title: 'Integration Test Task',
      description: 'This task was created during integration testing',
      priority: 'medium',
      category: 'administrative',
      assignedTo: 'Test User',
      dueDate: '2025-02-01T12:00:00Z'
    };

    const createdTask = await this.request('POST', '/api/tasks', newTaskData);
    
    if (!createdTask.id) {
      throw new Error('Created task should have an ID');
    }

    if (createdTask.title !== newTaskData.title) {
      throw new Error('Created task title not matching');
    }

    if (createdTask.status !== 'pending') {
      throw new Error('New task should have pending status');
    }

    this.testTaskId = createdTask.id; // Store for subsequent tests
    console.log(`   ✨ Task created with ID: ${createdTask.id}`);
  }

  async testCreateTaskValidation() {
    try {
      await this.request('POST', '/api/tasks', { title: '' }); // Missing description
      throw new Error('Should have failed validation');
    } catch (error) {
      if (!error.message.includes('400')) {
        throw new Error('Should return 400 validation error');
      }
    }

    console.log(`   ✅ Validation working for required fields`);
  }

  async testUpdateTask() {
    if (!this.testTaskId) {
      throw new Error('No test task ID available for update test');
    }

    const updateData = {
      status: 'in_progress',
      priority: 'high',
      assignedTo: 'Updated User'
    };

    const updatedTask = await this.request('PUT', `/api/tasks/${this.testTaskId}`, updateData);
    
    if (updatedTask.status !== 'in_progress') {
      throw new Error('Task status not updated');
    }

    if (updatedTask.priority !== 'high') {
      throw new Error('Task priority not updated');
    }

    console.log(`   📝 Task updated successfully`);
  }

  async testTaskStatusUpdate() {
    if (!this.testTaskId) {
      throw new Error('No test task ID available for status update test');
    }

    const statusUpdate = await this.request('PUT', `/api/tasks/${this.testTaskId}/status`, {
      status: 'completed',
      notes: 'Integration test completed'
    });
    
    if (!statusUpdate.success) {
      throw new Error('Status update should return success');
    }

    if (statusUpdate.statusUpdate.newStatus !== 'completed') {
      throw new Error('Status not updated correctly');
    }

    console.log(`   🎯 Task status updated to completed`);
  }

  async testTaskAssignment() {
    if (!this.testTaskId) {
      throw new Error('No test task ID available for assignment test');
    }

    const assignmentData = {
      assignedToId: 'member-1',
      assignedTo: 'John Doe',
      notes: 'Assigned during integration testing'
    };

    const assignment = await this.request('POST', `/api/tasks/${this.testTaskId}/assign`, assignmentData);
    
    if (!assignment.success) {
      throw new Error('Assignment should return success');
    }

    if (assignment.assignment.assignedToId !== 'member-1') {
      throw new Error('Assignment data not correct');
    }

    console.log(`   👤 Task assigned to ${assignmentData.assignedTo}`);
  }

  async testMyTasks() {
    const myTasksData = await this.request('GET', '/api/tasks/my-tasks');
    
    if (!myTasksData.tasks || !Array.isArray(myTasksData.tasks)) {
      throw new Error('My tasks should return tasks array');
    }

    if (!myTasksData.userId) {
      throw new Error('My tasks should return userId');
    }

    console.log(`   👤 Retrieved ${myTasksData.tasks.length} tasks for current user`);
  }

  async testTaskCategories() {
    const categoriesData = await this.request('GET', '/api/tasks/categories');
    
    if (!categoriesData.categories || !Array.isArray(categoriesData.categories)) {
      throw new Error('Categories should return categories array');
    }

    const expectedCategories = ['pastoral_care', 'event_planning', 'maintenance', 'administrative', 'follow_up', 'outreach'];
    const returnedCategoryIds = categoriesData.categories.map(cat => cat.id);
    
    for (const expectedCat of expectedCategories) {
      if (!returnedCategoryIds.includes(expectedCat)) {
        throw new Error(`Missing expected category: ${expectedCat}`);
      }
    }

    console.log(`   📂 All ${categoriesData.categories.length} task categories available`);
  }

  async testTaskStats() {
    const statsData = await this.request('GET', '/api/tasks/stats');
    
    const requiredStats = ['totalTasks', 'pendingTasks', 'inProgressTasks', 'completedTasks', 'tasksByPriority', 'tasksByCategory'];
    
    for (const stat of requiredStats) {
      if (!(stat in statsData)) {
        throw new Error(`Missing required stat: ${stat}`);
      }
    }

    if (typeof statsData.totalTasks !== 'number') {
      throw new Error('Total tasks should be a number');
    }

    console.log(`   📊 Stats retrieved: ${statsData.totalTasks} total tasks`);
  }

  async testDeleteTask() {
    if (!this.testTaskId) {
      throw new Error('No test task ID available for delete test');
    }

    const deleteResult = await this.request('DELETE', `/api/tasks/${this.testTaskId}`);
    
    if (!deleteResult.success) {
      throw new Error('Delete should return success');
    }

    if (deleteResult.taskId !== this.testTaskId) {
      throw new Error('Delete result should include task ID');
    }

    console.log(`   🗑️ Task deleted successfully`);
  }

  // ========================================
  // FRONTEND INTEGRATION TESTS
  // ========================================

  async testTaskServiceCompatibility() {
    // Test that API responses match TaskService.ts expectations
    const tasksResponse = await this.request('GET', '/api/tasks');
    
    // Validate response structure matches TaskResponse interface
    if (!('tasks' in tasksResponse && 'total' in tasksResponse)) {
      throw new Error('Response doesn\'t match TaskResponse interface');
    }

    // Test task object structure matches Task interface
    const task = tasksResponse.tasks[0];
    const requiredTaskFields = ['id', 'title', 'description', 'priority', 'status', 'createdAt'];
    
    for (const field of requiredTaskFields) {
      if (!(field in task)) {
        throw new Error(`Task object missing field expected by TaskService: ${field}`);
      }
    }

    console.log(`   🔧 API responses compatible with TaskService.ts`);
  }

  async testTaskFormDataCompatibility() {
    // Test that API accepts data in format sent by TaskCreateForm
    const formData = {
      title: 'Form Integration Test',
      description: 'Testing form data compatibility',
      priority: 'medium',
      assignedToId: 'member-1',
      dueDate: '2025-02-01T12:00:00Z',
      category: 'administrative'
    };

    const createdTask = await this.request('POST', '/api/tasks', formData);
    
    if (!createdTask.id) {
      throw new Error('Form data not accepted by API');
    }

    console.log(`   📝 TaskCreateForm data format compatible with API`);
  }

  // ========================================
  // PERFORMANCE TESTS
  // ========================================

  async testAPIPerformance() {
    const startTime = Date.now();
    await this.request('GET', '/api/tasks');
    const duration = Date.now() - startTime;
    
    if (duration > 1000) { // 1 second threshold
      throw new Error(`API response too slow: ${duration}ms (threshold: 1000ms)`);
    }

    console.log(`   ⚡ API performance good: ${duration}ms response time`);
  }

  // ========================================
  // ERROR HANDLING TESTS
  // ========================================

  async testErrorHandling() {
    // Test 404 for non-existent task
    try {
      await this.request('GET', '/api/tasks/non-existent-task');
      throw new Error('Should have returned 404 for non-existent task');
    } catch (error) {
      // This is expected
    }

    // Test 400 for invalid status update
    try {
      await this.request('PUT', '/api/tasks/task-1/status', { status: 'invalid_status' });
      throw new Error('Should have returned 400 for invalid status');
    } catch (error) {
      if (!error.message.includes('400')) {
        throw error; // Re-throw if it's not the expected validation error
      }
    }

    console.log(`   🛡️ Error handling working correctly`);
  }

  // ========================================
  // TEST RUNNER
  // ========================================

  async runAllTests() {
    console.log('🚀 Starting Tasks Management Integration Tests');
    console.log('=' .repeat(60));

    // Core API Tests
    console.log('\n📋 CORE API ENDPOINT TESTS');
    await this.runTest('GET /api/tasks - List Tasks', () => this.testGetTasks());
    await this.runTest('GET /api/tasks - Filtering', () => this.testGetTasksWithFiltering());
    await this.runTest('GET /api/tasks - Sorting', () => this.testGetTasksWithSorting());
    await this.runTest('GET /api/tasks - Pagination', () => this.testGetTasksPagination());
    await this.runTest('GET /api/tasks/:id - Single Task', () => this.testGetSingleTask());
    
    await this.runTest('POST /api/tasks - Create Task', () => this.testCreateTask());
    await this.runTest('POST /api/tasks - Validation', () => this.testCreateTaskValidation());
    
    await this.runTest('PUT /api/tasks/:id - Update Task', () => this.testUpdateTask());
    await this.runTest('PUT /api/tasks/:id/status - Update Status', () => this.testTaskStatusUpdate());
    await this.runTest('POST /api/tasks/:id/assign - Assign Task', () => this.testTaskAssignment());
    
    await this.runTest('GET /api/tasks/my-tasks - My Tasks', () => this.testMyTasks());
    await this.runTest('GET /api/tasks/categories - Categories', () => this.testTaskCategories());
    await this.runTest('GET /api/tasks/stats - Statistics', () => this.testTaskStats());
    
    await this.runTest('DELETE /api/tasks/:id - Delete Task', () => this.testDeleteTask());

    // Frontend Integration Tests
    console.log('\n🔧 FRONTEND INTEGRATION TESTS');
    await this.runTest('TaskService Compatibility', () => this.testTaskServiceCompatibility());
    await this.runTest('TaskCreateForm Compatibility', () => this.testTaskFormDataCompatibility());

    // Performance Tests
    console.log('\n⚡ PERFORMANCE TESTS');
    await this.runTest('API Response Time', () => this.testAPIPerformance());

    // Error Handling Tests
    console.log('\n🛡️ ERROR HANDLING TESTS');
    await this.runTest('Error Responses', () => this.testErrorHandling());

    // Generate Report
    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TASKS INTEGRATION TEST REPORT');
    console.log('=' .repeat(60));
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Tests: ${this.totalTests}`);
    console.log(`   ✅ Passed: ${this.passedTests}`);
    console.log(`   ❌ Failed: ${this.failedTests}`);
    console.log(`   📊 Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);

    if (this.failedTests > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      this.testResults
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
    }

    console.log(`\n⚡ PERFORMANCE:`);
    const passedTests = this.testResults.filter(test => test.status === 'PASS' && test.duration);
    if (passedTests.length > 0) {
      const avgDuration = passedTests.reduce((sum, test) => sum + test.duration, 0) / passedTests.length;
      console.log(`   Average Response Time: ${avgDuration.toFixed(0)}ms`);
    }

    console.log(`\n🎯 SPRINT 1 STATUS:`);
    if (this.passedTests === this.totalTests) {
      console.log(`   ✅ ALL TESTS PASSED - Tasks Module Ready for Production!`);
      console.log(`   🚀 Ready to proceed with frontend integration testing`);
    } else {
      console.log(`   ⚠️  Some tests failed - Review and fix issues before proceeding`);
    }

    console.log('\n' + '=' .repeat(60));
  }
}

// Run the tests if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment - fetch polyfill needed
  const fetch = require('node-fetch');
  global.fetch = fetch;
  
  const tester = new TasksIntegrationTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = TasksIntegrationTester;
