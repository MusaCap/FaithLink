import { test, expect, Page } from '@playwright/test';

// Test data
const testJourneyTemplate = {
  name: 'E2E New Member Journey',
  description: 'Complete spiritual growth path for new church members',
  difficulty: 'beginner',
  milestones: [
    {
      name: 'Welcome & Orientation',
      description: 'Meet with pastor and learn about church vision and values'
    },
    {
      name: 'Baptism Preparation', 
      description: 'Complete baptism class and prepare for ceremony'
    },
    {
      name: 'Small Group Connection',
      description: 'Join a life group and build community relationships'
    }
  ]
};

const testUser = {
  email: 'admin@faithlink360.com',
  password: 'admin123'
};

describe('Journey Templates Module E2E Tests', () => {
  let page: Page;

  beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  afterEach(async () => {
    await page.close();
  });

  describe('Journey Template Management', () => {
    test('should complete full journey template lifecycle', async () => {
      // Login as admin
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/.*\/dashboard/);
      
      // Navigate to Journey Templates
      await page.click('a[href="/journey-templates"]');
      await expect(page).toHaveURL(/.*\/journey-templates/);
      
      // Create new journey template
      await page.click('text=Create Template');
      await expect(page).toHaveURL(/.*\/journey-templates\/new/);
      
      // Fill template basic info
      await page.fill('input[name="name"]', testJourneyTemplate.name);
      await page.fill('textarea[name="description"]', testJourneyTemplate.description);
      await page.selectOption('select[name="difficulty"]', testJourneyTemplate.difficulty);
      
      // Add milestones
      for (let i = 0; i < testJourneyTemplate.milestones.length; i++) {
        if (i > 0) {
          await page.click('button:has-text("Add Milestone")');
        }
        
        const milestone = testJourneyTemplate.milestones[i];
        await page.fill(`input[name="milestones.${i}.name"]`, milestone.name);
        await page.fill(`textarea[name="milestones.${i}.description"]`, milestone.description);
      }
      
      // Submit template
      await page.click('button[type="submit"]');
      
      // Verify redirect and template appears in list
      await expect(page).toHaveURL(/.*\/journey-templates/);
      await expect(page.locator(`text=${testJourneyTemplate.name}`)).toBeVisible();
      
      // View template details
      await page.click(`text=${testJourneyTemplate.name}`);
      await expect(page.locator('h1').filter({ hasText: testJourneyTemplate.name })).toBeVisible();
      await expect(page.locator(`text=${testJourneyTemplate.description}`)).toBeVisible();
      
      // Verify milestones are shown
      for (const milestone of testJourneyTemplate.milestones) {
        await expect(page.locator(`text=${milestone.name}`)).toBeVisible();
      }
      
      // Edit template
      await page.click('text=Edit Template');
      const updatedName = testJourneyTemplate.name + ' Updated';
      await page.fill('input[name="name"]', updatedName);
      await page.click('button[type="submit"]');
      
      // Verify update
      await expect(page.locator('h1').filter({ hasText: updatedName })).toBeVisible();
    });
  });

  describe('Journey Assignment Workflow', () => {
    test('should assign journey to members', async () => {
      // Login
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      // Navigate to journey assignment
      await page.click('a[href="/journeys"]');
      await page.click('text=Assign Journey');
      await expect(page).toHaveURL(/.*\/journeys\/assign/);
      
      // Select journey template
      const templateRadio = page.locator('input[type="radio"][name="template"]').first();
      await templateRadio.click();
      
      // Select members
      const memberCheckboxes = page.locator('input[type="checkbox"][name*="member"]');
      const memberCount = await memberCheckboxes.count();
      
      // Select first few members
      for (let i = 0; i < Math.min(3, memberCount); i++) {
        await memberCheckboxes.nth(i).click();
      }
      
      // Assign mentor (optional)
      const mentorSelect = page.locator('select[name="mentor"]');
      if (await mentorSelect.count() > 0) {
        await mentorSelect.selectOption({ index: 1 });
      }
      
      // Add assignment notes
      await page.fill('textarea[name="notes"]', 'E2E test journey assignment');
      
      // Submit assignment
      await page.click('button[type="submit"]');
      
      // Verify redirect to journeys list
      await expect(page).toHaveURL(/.*\/journeys/);
      
      // Verify assigned journeys appear
      await expect(page.locator('.journey-item')).toHaveCount.greaterThan(0);
    });
  });

  describe('Member Journey Progress Tracking', () => {
    test('should track milestone progress and submissions', async () => {
      // Login as member
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', 'member@faithlink360.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // Navigate to my journeys
      await page.click('a[href="/journeys"]');
      
      // Click on first journey (if available)
      const journeyItems = page.locator('.journey-item a');
      if (await journeyItems.count() > 0) {
        await journeyItems.first().click();
        
        // Start first milestone
        const startButtons = page.locator('button:has-text("Start")');
        if (await startButtons.count() > 0) {
          await startButtons.first().click();
          
          // Verify milestone status changed
          await expect(page.locator('span:has-text("In Progress")')).toBeVisible();
          
          // Submit milestone work
          const submitButtons = page.locator('button:has-text("Submit")');
          if (await submitButtons.count() > 0) {
            await submitButtons.first().click();
            
            // Fill submission form
            await page.fill('textarea[name="submission"]', 
              'This is my reflection on completing this milestone. I learned about the church vision and feel excited to continue my journey.');
            
            await page.click('button:has-text("Submit")');
            
            // Verify submission status
            await expect(page.locator('span:has-text("Submitted")')).toBeVisible();
          }
        }
      }
    });
  });

  describe('Mentor Approval Workflow', () => {
    test('should allow mentors to review and approve submissions', async () => {
      // Login as group leader (mentor role)
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', 'leader@faithlink360.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // Navigate to member journeys
      await page.click('a[href="/journeys"]');
      
      // Find journey with submitted milestones
      const journeyItems = page.locator('.journey-item');
      if (await journeyItems.count() > 0) {
        // Look for journeys with submissions to review
        const submittedJourneys = page.locator('.journey-item:has(.badge:has-text("Submitted"))');
        
        if (await submittedJourneys.count() > 0) {
          await submittedJourneys.first().click();
          
          // Find submitted milestone
          const submittedMilestones = page.locator('.milestone:has(.badge:has-text("Submitted"))');
          
          if (await submittedMilestones.count() > 0) {
            // View submission
            await submittedMilestones.first().locator('button:has-text("Review")').click();
            
            // Provide feedback
            await page.fill('textarea[name="feedback"]', 
              'Great work on this milestone! Your reflection shows good understanding of our church vision.');
            
            // Approve submission
            await page.click('button:has-text("Approve")');
            
            // Verify approval status
            await expect(page.locator('span:has-text("Approved")')).toBeVisible();
          }
        }
      }
    });
  });

  describe('Journey Statistics and Reporting', () => {
    test('should display journey completion statistics', async () => {
      // Login as admin
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      // Navigate to dashboard
      await page.click('a[href="/dashboard"]');
      
      // Verify journey statistics are displayed
      await expect(page.locator('text=Journey Progress')).toBeVisible();
      await expect(page.locator('.stat-card:has-text("Templates")')).toBeVisible();
      await expect(page.locator('.stat-card:has-text("Active Journeys")')).toBeVisible();
      
      // Navigate to detailed journey reports
      await page.click('a[href="/journeys"]');
      
      // Test export functionality
      const exportButton = page.locator('button:has-text("Export")');
      if (await exportButton.count() > 0) {
        // Setup download listener
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();
        
        // Verify download started
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/journey.*\.csv|\.pdf/);
      }
    });
  });

  describe('Search and Filter Functionality', () => {
    test('should search and filter journey templates', async () => {
      // Login
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      await page.click('a[href="/journey-templates"]');
      
      // Test search functionality
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('Member');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Verify search results
      const templateItems = await page.locator('.template-item');
      const count = await templateItems.count();
      
      for (let i = 0; i < count; i++) {
        const templateName = await templateItems.nth(i).locator('.template-name').textContent();
        expect(templateName?.toLowerCase()).toContain('member');
      }
      
      // Clear search and test difficulty filter
      await searchInput.clear();
      await page.selectOption('select[name="difficulty"]', 'beginner');
      
      // Verify difficulty filter works
      const beginnerTemplates = await page.locator('.template-item .difficulty:has-text("Beginner")');
      expect(await beginnerTemplates.count()).toBeGreaterThan(0);
    });
  });

  describe('Mobile Responsiveness', () => {
    test('should work properly on mobile devices', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      // Login
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      // Open mobile menu
      await page.click('button[aria-label="Menu"]');
      await page.click('a[href="/journey-templates"]');
      
      // Verify mobile layout
      await expect(page.locator('.mobile-layout, .responsive-grid')).toBeVisible();
      
      // Test mobile template creation
      await page.click('button:has-text("Create")');
      
      // Fill form on mobile
      await page.fill('input[name="name"]', 'Mobile Journey Test');
      await page.fill('textarea[name="description"]', 'Journey created from mobile device');
      await page.selectOption('select[name="difficulty"]', 'intermediate');
      
      // Add milestone on mobile
      await page.fill('input[name="milestones.0.name"]', 'Mobile Milestone');
      await page.fill('textarea[name="milestones.0.description"]', 'Test milestone from mobile');
      
      // Submit and verify
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Mobile Journey Test')).toBeVisible();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle API errors gracefully', async () => {
      // Login
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      // Simulate network failure for journey templates
      await page.route('**/api/journey-templates', route => {
        route.abort('failed');
      });
      
      await page.click('a[href="/journey-templates"]');
      
      // Verify error message displayed
      await expect(page.locator('text=Failed to load journey templates')).toBeVisible();
      
      // Test retry functionality
      await page.unroute('**/api/journey-templates');
      await page.click('button:has-text("Retry")');
      
      // Should now load successfully
      await expect(page.locator('.templates-list')).toBeVisible();
    });

    test('should validate form inputs properly', async () => {
      // Login and navigate to create template
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      await page.click('a[href="/journey-templates"]');
      await page.click('text=Create Template');
      
      // Submit empty form
      await page.click('button[type="submit"]');
      
      // Verify validation errors
      await expect(page.locator('text=Template name is required')).toBeVisible();
      await expect(page.locator('text=Description is required')).toBeVisible();
      
      // Test milestone validation
      await page.fill('input[name="name"]', 'Test Template');
      await page.fill('textarea[name="description"]', 'Test Description');
      
      // Leave milestone fields empty and submit
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Milestone name is required')).toBeVisible();
    });
  });
});
