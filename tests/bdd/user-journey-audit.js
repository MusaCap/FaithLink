/**
 * FaithLink360 Complete User Journey Audit
 * Following Semantic Seed Venture Studio Coding Standards V2.0
 * 
 * This test suite validates EVERY user journey end-to-end to identify
 * gaps between intended UX and actual implementation.
 */

const puppeteer = require('puppeteer');
const { expect } = require('chai');

const FRONTEND_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

describe('🎭 FaithLink360 Complete User Journey Audit', function() {
  this.timeout(TEST_TIMEOUT);

  let browser;
  let page;
  const journeyResults = {
    totalJourneys: 0,
    successful: 0,
    failed: 0,
    userStoryGaps: [],
    pageGaps: [],
    featureGaps: []
  };

  before(async () => {
    console.log('\n🎯 Starting Complete User Journey Audit');
    console.log('===============================================');
    console.log('Testing ALL user journeys end-to-end...\n');
    
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for CI/CD
      defaultViewport: { width: 1200, height: 800 }
    });
    page = await browser.newPage();
    
    // Enable console logging for debugging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  });

  after(async () => {
    await browser?.close();
    
    console.log('\n📊 USER JOURNEY AUDIT RESULTS');
    console.log('=====================================');
    console.log(`🎭 Total Journeys: ${journeyResults.totalJourneys}`);
    console.log(`✅ Successful: ${journeyResults.successful}`);
    console.log(`❌ Failed: ${journeyResults.failed}`);
    console.log(`📈 Success Rate: ${((journeyResults.successful / journeyResults.totalJourneys) * 100).toFixed(1)}%`);
    
    if (journeyResults.userStoryGaps.length > 0) {
      console.log('\n🚨 USER STORY GAPS IDENTIFIED:');
      journeyResults.userStoryGaps.forEach(gap => console.log(`   • ${gap}`));
    }
    
    if (journeyResults.pageGaps.length > 0) {
      console.log('\n🚨 PAGE/COMPONENT GAPS:');
      journeyResults.pageGaps.forEach(gap => console.log(`   • ${gap}`));
    }
    
    if (journeyResults.featureGaps.length > 0) {
      console.log('\n🚨 FEATURE GAPS:');
      journeyResults.featureGaps.forEach(gap => console.log(`   • ${gap}`));
    }
  });

  // ============================================================================
  // ADMIN USER JOURNEYS
  // ============================================================================
  
  describe('👑 Admin User Journeys', () => {
    
    beforeEach(async () => {
      await page.goto(FRONTEND_URL);
    });

    describe('Journey 1: Admin Login and Dashboard Access', () => {
      it('should complete full admin login workflow', async () => {
        journeyResults.totalJourneys++;
        try {
          // Step 1: Navigate to login
          await page.waitForSelector('input[type="email"]', { timeout: 5000 });
          
          // Step 2: Enter credentials
          await page.type('input[type="email"]', 'admin@faithlink360.org');
          await page.type('input[type="password"]', 'admin123');
          
          // Step 3: Click login
          await page.click('button[type="submit"]');
          
          // Step 4: Verify dashboard access
          await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
          
          // Step 5: Verify admin navigation is available
          const memberLink = await page.$('a[href="/members"]');
          const groupsLink = await page.$('a[href="/groups"]');
          const eventsLink = await page.$('a[href="/events"]');
          
          expect(memberLink).to.not.be.null;
          expect(groupsLink).to.not.be.null;
          expect(eventsLink).to.not.be.null;
          
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.userStoryGaps.push('Admin login workflow incomplete or broken');
          throw error;
        }
      });
    });

    describe('Journey 2: Complete Member Management Workflow', () => {
      it('should create, edit, and manage members end-to-end', async () => {
        journeyResults.totalJourneys++;
        try {
          // Pre-requisite: Login as admin
          await page.type('input[type="email"]', 'admin@faithlink360.org');
          await page.type('input[type="password"]', 'admin123');
          await page.click('button[type="submit"]');
          await page.waitForSelector('[data-testid="dashboard"]');
          
          // Step 1: Navigate to members page
          await page.click('a[href="/members"]');
          await page.waitForSelector('[data-testid="members-list"]', { timeout: 5000 });
          
          // Step 2: Click "Add New Member" button
          await page.click('[data-testid="add-member-btn"]');
          await page.waitForSelector('[data-testid="member-form"]');
          
          // Step 3: Fill out member form
          await page.type('input[name="firstName"]', 'Test');
          await page.type('input[name="lastName"]', 'Member');
          await page.type('input[name="email"]', 'test@example.com');
          
          // Step 4: Submit member creation
          await page.click('button[type="submit"]');
          
          // Step 5: Verify member appears in list
          await page.waitForSelector('[data-testid="members-list"]');
          const memberExists = await page.$eval('[data-testid="members-list"]', 
            el => el.textContent.includes('Test Member'));
          
          expect(memberExists).to.be.true;
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.userStoryGaps.push('Member management workflow incomplete');
          journeyResults.pageGaps.push('Missing member form or list components');
          throw error;
        }
      });

      it('should assign deacon to member successfully', async () => {
        journeyResults.totalJourneys++;
        try {
          // Navigate to member edit
          await page.click('[data-testid="edit-member-btn"]:first-child');
          await page.waitForSelector('select[name="deaconId"]');
          
          // Select a deacon
          await page.select('select[name="deaconId"]', 'deacon1');
          
          // Save changes
          await page.click('button[type="submit"]');
          
          // Verify assignment
          await page.waitForSelector('[data-testid="member-deacon-assignment"]');
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.featureGaps.push('Deacon assignment functionality incomplete');
          // Don't throw - continue with other tests
        }
      });
    });

    describe('Journey 3: Group Management Workflow', () => {
      it('should create and manage groups with members', async () => {
        journeyResults.totalJourneys++;
        try {
          // Navigate to groups page
          await page.click('a[href="/groups"]');
          await page.waitForSelector('[data-testid="groups-list"]');
          
          // Create new group
          await page.click('[data-testid="add-group-btn"]');
          await page.waitForSelector('[data-testid="group-form"]');
          
          await page.type('input[name="name"]', 'Test Small Group');
          await page.type('textarea[name="description"]', 'Test group description');
          
          // Submit group creation
          await page.click('button[type="submit"]');
          
          // Verify group creation
          await page.waitForSelector('[data-testid="groups-list"]');
          const groupExists = await page.$eval('[data-testid="groups-list"]', 
            el => el.textContent.includes('Test Small Group'));
          
          expect(groupExists).to.be.true;
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.userStoryGaps.push('Group management workflow incomplete');
        }
      });

      it('should record group attendance successfully', async () => {
        journeyResults.totalJourneys++;
        try {
          // Click on group to view details
          await page.click('[data-testid="group-item"]:first-child');
          await page.waitForSelector('[data-testid="group-details"]');
          
          // Navigate to attendance tab
          await page.click('[data-testid="attendance-tab"]');
          await page.waitForSelector('[data-testid="attendance-form"]');
          
          // Record attendance
          await page.click('[data-testid="member-present-checkbox"]:first-child');
          await page.click('[data-testid="save-attendance-btn"]');
          
          // Verify attendance recorded
          await page.waitForSelector('[data-testid="attendance-success"]');
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.featureGaps.push('Group attendance tracking missing or broken');
        }
      });
    });

    describe('Journey 4: Event Management Workflow', () => {
      it('should create and manage events with registration', async () => {
        journeyResults.totalJourneys++;
        try {
          // Navigate to events page
          await page.click('a[href="/events"]');
          await page.waitForSelector('[data-testid="events-list"]');
          
          // Create new event
          await page.click('[data-testid="add-event-btn"]');
          await page.waitForSelector('[data-testid="event-form"]');
          
          await page.type('input[name="title"]', 'Test Church Event');
          await page.type('textarea[name="description"]', 'Test event description');
          await page.type('input[name="date"]', '2024-12-25');
          
          // Submit event creation
          await page.click('button[type="submit"]');
          
          // Verify event creation
          await page.waitForSelector('[data-testid="events-list"]');
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.userStoryGaps.push('Event management workflow incomplete');
        }
      });
    });
  });

  // ============================================================================
  // MEMBER USER JOURNEYS  
  // ============================================================================
  
  describe('👤 Member User Journeys', () => {
    
    describe('Journey 5: Member Self-Service Portal', () => {
      it('should allow members to view and update their profile', async () => {
        journeyResults.totalJourneys++;
        try {
          // Login as member
          await page.goto(`${FRONTEND_URL}/login`);
          await page.type('input[type="email"]', 'member@faithlink360.org');
          await page.type('input[type="password"]', 'member123');
          await page.click('button[type="submit"]');
          
          // Navigate to profile
          await page.waitForSelector('[data-testid="member-dashboard"]');
          await page.click('a[href="/profile"]');
          await page.waitForSelector('[data-testid="member-profile"]');
          
          // Update profile information
          await page.click('[data-testid="edit-profile-btn"]');
          await page.waitForSelector('input[name="phone"]');
          await page.clear('input[name="phone"]');
          await page.type('input[name="phone"]', '555-1234');
          
          // Save changes
          await page.click('button[type="submit"]');
          await page.waitForSelector('[data-testid="profile-updated"]');
          
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.userStoryGaps.push('Member self-service portal incomplete');
        }
      });

      it('should allow members to view their spiritual journey progress', async () => {
        journeyResults.totalJourneys++;
        try {
          // Navigate to journey page
          await page.click('a[href="/journey"]');
          await page.waitForSelector('[data-testid="member-journey"]');
          
          // Verify journey milestones are displayed
          const milestones = await page.$$('[data-testid="milestone-item"]');
          expect(milestones.length).to.be.greaterThan(0);
          
          // Mark milestone as complete
          await page.click('[data-testid="complete-milestone-btn"]:first-child');
          await page.waitForSelector('[data-testid="milestone-completed"]');
          
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.featureGaps.push('Spiritual journey tracking for members incomplete');
        }
      });
    });

    describe('Journey 6: Event Registration Workflow', () => {
      it('should allow members to register for events', async () => {
        journeyResults.totalJourneys++;
        try {
          // Navigate to events page
          await page.click('a[href="/events"]');
          await page.waitForSelector('[data-testid="public-events-list"]');
          
          // Register for an event
          await page.click('[data-testid="register-event-btn"]:first-child');
          await page.waitForSelector('[data-testid="registration-form"]');
          
          // Fill registration details
          await page.type('textarea[name="notes"]', 'Looking forward to attending!');
          await page.click('button[type="submit"]');
          
          // Verify registration success
          await page.waitForSelector('[data-testid="registration-success"]');
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.userStoryGaps.push('Event registration workflow for members incomplete');
        }
      });
    });
  });

  // ============================================================================
  // DEACON USER JOURNEYS
  // ============================================================================
  
  describe('👨‍💼 Deacon User Journeys', () => {
    
    describe('Journey 7: Pastoral Care Management', () => {
      it('should allow deacons to manage assigned members', async () => {
        journeyResults.totalJourneys++;
        try {
          // Login as deacon
          await page.goto(`${FRONTEND_URL}/login`);
          await page.type('input[type="email"]', 'deacon@faithlink360.org');
          await page.type('input[type="password"]', 'deacon123');
          await page.click('button[type="submit"]');
          
          // Navigate to assigned members
          await page.waitForSelector('[data-testid="deacon-dashboard"]');
          await page.click('a[href="/my-members"]');
          await page.waitForSelector('[data-testid="assigned-members-list"]');
          
          // Create care record
          await page.click('[data-testid="add-care-record-btn"]:first-child');
          await page.waitForSelector('[data-testid="care-record-form"]');
          
          await page.type('textarea[name="notes"]', 'Visited member at home');
          await page.select('select[name="type"]', 'visit');
          await page.click('button[type="submit"]');
          
          await page.waitForSelector('[data-testid="care-record-success"]');
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.userStoryGaps.push('Deacon pastoral care workflow incomplete');
        }
      });
    });
  });

  // ============================================================================
  // MOBILE RESPONSIVENESS JOURNEYS
  // ============================================================================
  
  describe('📱 Mobile User Experience', () => {
    
    beforeEach(async () => {
      await page.setViewport({ width: 375, height: 667 }); // iPhone viewport
    });

    describe('Journey 8: Mobile Navigation and Functionality', () => {
      it('should provide full functionality on mobile devices', async () => {
        journeyResults.totalJourneys++;
        try {
          await page.goto(FRONTEND_URL);
          
          // Test mobile menu
          await page.click('[data-testid="mobile-menu-toggle"]');
          await page.waitForSelector('[data-testid="mobile-menu"]');
          
          // Navigate to members on mobile
          await page.click('[data-testid="mobile-members-link"]');
          await page.waitForSelector('[data-testid="members-list"]');
          
          // Verify mobile-optimized layout
          const memberCards = await page.$$('[data-testid="member-card-mobile"]');
          expect(memberCards.length).to.be.greaterThan(0);
          
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.featureGaps.push('Mobile responsiveness incomplete');
        }
      });
    });
  });

  // ============================================================================
  // ERROR HANDLING JOURNEYS
  // ============================================================================
  
  describe('🚨 Error Handling and Edge Cases', () => {
    
    describe('Journey 9: Graceful Error Handling', () => {
      it('should handle API failures gracefully', async () => {
        journeyResults.totalJourneys++;
        try {
          // Simulate API failure by intercepting requests
          await page.setRequestInterception(true);
          page.on('request', request => {
            if (request.url().includes('/api/members')) {
              request.respond({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Server Error' })
              });
            } else {
              request.continue();
            }
          });
          
          await page.goto(`${FRONTEND_URL}/members`);
          
          // Verify error message is displayed
          await page.waitForSelector('[data-testid="error-message"]');
          const errorMessage = await page.$eval('[data-testid="error-message"]', 
            el => el.textContent);
          expect(errorMessage).to.include('Unable to load');
          
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.featureGaps.push('Error handling incomplete - users see broken interface');
        }
      });

      it('should handle form validation errors properly', async () => {
        journeyResults.totalJourneys++;
        try {
          await page.goto(`${FRONTEND_URL}/members/new`);
          
          // Submit form without required fields
          await page.click('button[type="submit"]');
          
          // Verify validation messages
          await page.waitForSelector('[data-testid="validation-error"]');
          const validationErrors = await page.$$('[data-testid="validation-error"]');
          expect(validationErrors.length).to.be.greaterThan(0);
          
          journeyResults.successful++;
        } catch (error) {
          journeyResults.failed++;
          journeyResults.featureGaps.push('Form validation incomplete');
        }
      });
    });
  });
});

module.exports = { journeyResults };
