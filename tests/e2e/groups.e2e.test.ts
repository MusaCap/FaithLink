import { test, expect, Page } from '@playwright/test';

// Test data
const testGroup = {
  name: 'E2E Test Group',
  type: 'LIFEGROUP',
  description: 'End-to-end test group for automated testing'
};

const testUser = {
  email: 'admin@faithlink360.com',
  password: 'admin123'
};

describe('Groups Module E2E Tests', () => {
  let page: Page;

  beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  afterEach(async () => {
    await page.close();
  });

  describe('Authentication Flow', () => {
    test('should login with admin credentials', async () => {
      await page.click('a[href="/login"]');
      
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/.*\/dashboard/);
      await expect(page.locator('text=Admin User')).toBeVisible();
    });
  });

  describe('Group Management Workflow', () => {
    test('should complete full group lifecycle', async () => {
      // Login
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/.*\/dashboard/);
      
      // Navigate to Groups
      await page.click('a[href="/groups"]');
      await expect(page).toHaveURL(/.*\/groups/);
      
      // Create new group
      await page.click('text=Create Group');
      await expect(page).toHaveURL(/.*\/groups\/new/);
      
      // Fill out group form
      await page.fill('input[name="name"]', testGroup.name);
      await page.selectOption('select[name="type"]', testGroup.type);
      await page.fill('textarea[name="description"]', testGroup.description);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Verify redirect to groups list
      await expect(page).toHaveURL(/.*\/groups/);
      await expect(page.locator(`text=${testGroup.name}`)).toBeVisible();
      
      // Click on created group
      await page.click(`text=${testGroup.name}`);
      
      // Verify group detail page
      await expect(page.locator('h1').filter({ hasText: testGroup.name })).toBeVisible();
      await expect(page.locator(`text=${testGroup.description}`)).toBeVisible();
      
      // Edit group
      await page.click('text=Edit Group');
      const updatedName = testGroup.name + ' Updated';
      await page.fill('input[name="name"]', updatedName);
      await page.click('button[type="submit"]');
      
      // Verify update
      await expect(page.locator('h1').filter({ hasText: updatedName })).toBeVisible();
      
      // Delete group
      await page.click('button:has-text("Delete")');
      await page.click('button:has-text("Confirm Delete")');
      
      // Verify deletion
      await expect(page).toHaveURL(/.*\/groups/);
      await expect(page.locator(`text=${updatedName}`)).not.toBeVisible();
    });
  });

  describe('Group Member Management', () => {
    test('should add and manage group members', async () => {
      // Login and create group (setup)
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      await page.click('a[href="/groups"]');
      await page.click('text=Create Group');
      
      await page.fill('input[name="name"]', 'Member Test Group');
      await page.selectOption('select[name="type"]', 'LIFEGROUP');
      await page.fill('textarea[name="description"]', 'Test group for member management');
      await page.click('button[type="submit"]');
      
      // Click on created group
      await page.click('text=Member Test Group');
      
      // Add member
      await page.click('button:has-text("Add Member")');
      await page.selectOption('select[name="memberId"]', { index: 1 }); // Select first available member
      await page.click('button:has-text("Add to Group")');
      
      // Verify member added
      await expect(page.locator('.member-list .member-item')).toHaveCount(1);
      
      // Promote member to co-leader
      await page.click('button:has-text("Promote")');
      await expect(page.locator('text=Co-Leader')).toBeVisible();
      
      // Remove member
      await page.click('button:has-text("Remove")');
      await page.click('button:has-text("Confirm")');
      
      // Verify member removed
      await expect(page.locator('.member-list .member-item')).toHaveCount(0);
    });
  });

  describe('Attendance Tracking', () => {
    test('should record and view attendance', async () => {
      // Login and navigate to existing group
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      await page.click('a[href="/groups"]');
      
      // Assume there's an existing group with members
      await page.click('.group-item:first-child a');
      
      // Navigate to attendance
      await page.click('a[href*="/attendance"]');
      
      // Record new attendance
      await page.click('text=Record Attendance');
      
      // Mark members present/absent
      const memberRows = await page.locator('.member-row');
      const count = await memberRows.count();
      
      for (let i = 0; i < count; i++) {
        const row = memberRows.nth(i);
        // Alternate between present and absent
        if (i % 2 === 0) {
          await row.locator('button:has-text("Present")').click();
        } else {
          await row.locator('button:has-text("Absent")').click();
        }
      }
      
      // Add session notes
      await page.fill('textarea[name="notes"]', 'Test attendance session from E2E test');
      
      // Save attendance
      await page.click('button:has-text("Save Attendance")');
      
      // Verify saved
      await expect(page).toHaveURL(/.*\/attendance/);
      await expect(page.locator('text=Test attendance session')).toBeVisible();
      
      // View attendance history
      await page.click('text=View History');
      await expect(page.locator('.attendance-session')).toHaveCount.greaterThan(0);
    });
  });

  describe('Search and Filter', () => {
    test('should search and filter groups', async () => {
      // Login
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      await page.click('a[href="/groups"]');
      
      // Test search functionality
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('Youth');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Verify filtered results
      const groupItems = await page.locator('.group-item');
      const count = await groupItems.count();
      
      for (let i = 0; i < count; i++) {
        const groupName = await groupItems.nth(i).locator('.group-name').textContent();
        expect(groupName?.toLowerCase()).toContain('youth');
      }
      
      // Clear search
      await searchInput.clear();
      
      // Test type filter
      await page.selectOption('select[name="type"]', 'MINISTRY');
      await page.waitForTimeout(1000);
      
      // Verify type filter works
      const ministryGroups = await page.locator('.group-item .group-type:has-text("Ministry")');
      expect(await ministryGroups.count()).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Login
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      // Simulate network failure
      await page.route('**/api/groups', route => {
        route.abort('failed');
      });
      
      await page.click('a[href="/groups"]');
      
      // Verify error message displayed
      await expect(page.locator('text=Failed to load groups')).toBeVisible();
      
      // Verify retry functionality
      await page.unroute('**/api/groups');
      await page.click('button:has-text("Retry")');
      
      // Should now load successfully
      await expect(page.locator('.groups-list')).toBeVisible();
    });
  });

  describe('Responsive Design', () => {
    test('should work on mobile devices', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      // Login
      await page.click('a[href="/login"]');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      // Open mobile menu
      await page.click('button[aria-label="Menu"]');
      await page.click('a[href="/groups"]');
      
      // Verify mobile layout
      await expect(page.locator('.mobile-layout')).toBeVisible();
      
      // Test mobile group creation
      await page.click('button:has-text("Create")');
      
      // Fill form on mobile
      await page.fill('input[name="name"]', 'Mobile Test Group');
      await page.selectOption('select[name="type"]', 'TEAM');
      
      // Submit and verify
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Mobile Test Group')).toBeVisible();
    });
  });
});
