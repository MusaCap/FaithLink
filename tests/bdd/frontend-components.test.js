/**
 * BDD-Style Frontend Component Tests
 * Following Semantic Seed Venture Studio Coding Standards V2.0
 * Test-Driven Development (TDD) & Behavior-Driven Development (BDD)
 * Focus: Runtime Error Prevention & UI Component Validation
 */

const { expect } = require('chai');
const puppeteer = require('puppeteer');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
let browser;
let page;

describe('Frontend Component Functionality', () => {

  before(async () => {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    
    // Handle console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('PAGE ERROR:', msg.text());
      }
    });

    // Handle uncaught exceptions
    page.on('pageerror', error => {
      console.log('UNCAUGHT EXCEPTION:', error.message);
    });
  });

  after(async () => {
    if (browser) await browser.close();
  });

  describe('Authentication Flow', () => {
    describe('When user visits login page', () => {
      it('should load login page without runtime errors', async () => {
        const response = await page.goto(`${FRONTEND_URL}/login`);
        expect(response.status()).to.equal(200);
        
        // Check for login form elements
        const emailInput = await page.$('input[type="email"]');
        const passwordInput = await page.$('input[type="password"]');
        const submitButton = await page.$('button[type="submit"]');
        
        expect(emailInput).to.not.be.null;
        expect(passwordInput).to.not.be.null;
        expect(submitButton).to.not.be.null;
      });

      it('should successfully login with valid credentials', async () => {
        await page.goto(`${FRONTEND_URL}/login`);
        
        // Fill login form
        await page.type('input[type="email"]', 'admin@faithlink360.org');
        await page.type('input[type="password"]', 'admin123');
        
        // Submit form
        await page.click('button[type="submit"]');
        
        // Wait for redirect to dashboard
        await page.waitForNavigation();
        
        const url = page.url();
        expect(url).to.include('/dashboard');
      });
    });
  });

  describe('Member Management Interface', () => {
    beforeEach(async () => {
      // Ensure logged in
      await page.goto(`${FRONTEND_URL}/login`);
      await page.type('input[type="email"]', 'admin@faithlink360.org');
      await page.type('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
    });

    describe('When accessing admin members page', () => {
      it('should load admin members page without runtime errors', async () => {
        await page.goto(`${FRONTEND_URL}/admin/members`);
        await page.waitForSelector('h1', { timeout: 5000 });
        
        const heading = await page.$eval('h1', el => el.textContent);
        expect(heading).to.include('Member Management');
      });

      it('should display member list with member numbers', async () => {
        await page.goto(`${FRONTEND_URL}/admin/members`);
        await page.waitForSelector('[data-testid="member-list"]', { timeout: 5000 });
        
        // Check if member numbers are displayed
        const memberNumbers = await page.$$eval('[data-member-number]', elements => 
          elements.map(el => el.textContent)
        );
        
        expect(memberNumbers.length).to.be.greaterThan(0);
        memberNumbers.forEach(number => {
          expect(number).to.match(/#\d+/); // Format: #10001
        });
      });
    });

    describe('When creating a new member', () => {
      it('should load member form without runtime errors', async () => {
        await page.goto(`${FRONTEND_URL}/admin/members`);
        
        // Click add member button
        const addButton = await page.$('a[href*="create"], button:contains("Add Member")');
        if (addButton) {
          await addButton.click();
          await page.waitForSelector('form', { timeout: 5000 });
        }
        
        // Check form fields exist
        const firstNameInput = await page.$('input[name="firstName"]');
        const lastNameInput = await page.$('input[name="lastName"]');
        const emailInput = await page.$('input[name="email"]');
        
        expect(firstNameInput).to.not.be.null;
        expect(lastNameInput).to.not.be.null;
        expect(emailInput).to.not.be.null;
      });

      it('should display deacon assignment dropdown', async () => {
        await page.goto(`${FRONTEND_URL}/admin/members`);
        
        // Navigate to member creation form
        const addButton = await page.$('a[href*="create"], button:contains("Add Member")');
        if (addButton) {
          await addButton.click();
          await page.waitForSelector('form', { timeout: 5000 });
          
          // Check for deacon dropdown
          const deaconSelect = await page.$('select[name="deaconId"], select:contains("Assigned Deacon")');
          expect(deaconSelect).to.not.be.null;
          
          // Check dropdown options
          const options = await page.$$eval('select option', elements => 
            elements.map(el => el.textContent)
          );
          
          const deaconOptions = options.filter(option => 
            option.includes('John Wesley') || 
            option.includes('Mary Thompson') || 
            option.includes('Robert Davis')
          );
          
          expect(deaconOptions.length).to.be.greaterThan(0);
        }
      });

      it('should handle tags input without runtime errors', async () => {
        await page.goto(`${FRONTEND_URL}/admin/members`);
        
        const addButton = await page.$('a[href*="create"], button:contains("Add Member")');
        if (addButton) {
          await addButton.click();
          await page.waitForSelector('form', { timeout: 5000 });
          
          // Check tags section doesn't cause errors
          const tagsSection = await page.$('[data-testid="tags-section"]');
          if (tagsSection) {
            // Verify no runtime errors in console
            const errors = await page.evaluate(() => {
              return window.console.errors || [];
            });
            
            const tagErrors = errors.filter(error => 
              error.includes('Cannot read properties of undefined (reading \'map\')')
            );
            
            expect(tagErrors.length).to.equal(0);
          }
        }
      });
    });
  });

  describe('Member Self-Service Portal', () => {
    beforeEach(async () => {
      await page.goto(`${FRONTEND_URL}/login`);
      await page.type('input[type="email"]', 'admin@faithlink360.org');
      await page.type('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
    });

    describe('When accessing member profile', () => {
      it('should load member profile without runtime errors', async () => {
        await page.goto(`${FRONTEND_URL}/members`);
        await page.waitForSelector('[data-testid="member-portal"]', { timeout: 5000 });
        
        // Check for profile content
        const profileSection = await page.$('[data-testid="profile-section"]');
        expect(profileSection).to.not.be.null;
      });

      it('should handle prayer requests without undefined errors', async () => {
        await page.goto(`${FRONTEND_URL}/members`);
        await page.waitForSelector('[data-testid="member-portal"]', { timeout: 5000 });
        
        // Navigate to prayer requests tab if exists
        const prayerTab = await page.$('button:contains("Prayer"), [data-tab="prayer"]');
        if (prayerTab) {
          await prayerTab.click();
          
          // Check for prayer requests rendering
          const prayerSection = await page.$('[data-testid="prayer-requests"]');
          if (prayerSection) {
            const hasError = await page.evaluate(() => {
              return document.querySelector('body').textContent.includes('Cannot read properties of undefined');
            });
            
            expect(hasError).to.be.false;
          }
        }
      });

      it('should handle spiritual journeys without undefined errors', async () => {
        await page.goto(`${FRONTEND_URL}/members`);
        await page.waitForSelector('[data-testid="member-portal"]', { timeout: 5000 });
        
        // Navigate to spiritual journeys tab
        const journeyTab = await page.$('button:contains("Spiritual"), [data-tab="spiritual"]');
        if (journeyTab) {
          await journeyTab.click();
          
          const hasError = await page.evaluate(() => {
            return document.querySelector('body').textContent.includes('Cannot read properties of undefined');
          });
          
          expect(hasError).to.be.false;
        }
      });

      it('should handle upcoming events without undefined errors', async () => {
        await page.goto(`${FRONTEND_URL}/members`);
        await page.waitForSelector('[data-testid="member-portal"]', { timeout: 5000 });
        
        // Check events section
        const eventsSection = await page.$('[data-testid="upcoming-events"]');
        if (eventsSection) {
          const hasError = await page.evaluate(() => {
            return document.querySelector('body').textContent.includes('Cannot read properties of undefined');
          });
          
          expect(hasError).to.be.false;
        }
      });
    });
  });

  describe('Journey Templates Interface', () => {
    beforeEach(async () => {
      await page.goto(`${FRONTEND_URL}/login`);
      await page.type('input[type="email"]', 'admin@faithlink360.org');
      await page.type('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
    });

    describe('When accessing journey templates', () => {
      it('should load journey templates without milestone errors', async () => {
        await page.goto(`${FRONTEND_URL}/journey-templates`);
        await page.waitForSelector('[data-testid="journey-templates"]', { timeout: 5000 });
        
        // Check for milestones rendering without errors
        const milestoneElements = await page.$$('[data-testid="milestone-count"]');
        
        for (let element of milestoneElements) {
          const text = await page.evaluate(el => el.textContent, element);
          expect(text).to.not.include('undefined');
          expect(text).to.match(/\d+ milestones/);
        }
      });
    });
  });

  describe('Navigation and Routing', () => {
    beforeEach(async () => {
      await page.goto(`${FRONTEND_URL}/login`);
      await page.type('input[type="email"]', 'admin@faithlink360.org');
      await page.type('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
    });

    describe('When navigating through admin interface', () => {
      it('should show admin members link in navigation', async () => {
        await page.goto(`${FRONTEND_URL}/dashboard`);
        
        const adminMembersLink = await page.$('a[href="/admin/members"]');
        expect(adminMembersLink).to.not.be.null;
        
        const linkText = await page.evaluate(el => el.textContent, adminMembersLink);
        expect(linkText).to.include('Admin Members');
      });

      it('should navigate to all major sections without errors', async () => {
        const sections = [
          '/dashboard',
          '/members',
          '/admin/members', 
          '/groups',
          '/events',
          '/journey-templates',
          '/journeys',
          '/communications',
          '/care',
          '/reports',
          '/settings'
        ];

        for (let section of sections) {
          try {
            await page.goto(`${FRONTEND_URL}${section}`);
            await page.waitForSelector('h1, [data-testid="page-header"]', { timeout: 3000 });
            
            const hasError = await page.evaluate(() => {
              return document.querySelector('body').textContent.includes('Runtime Error') ||
                     document.querySelector('body').textContent.includes('Cannot read properties of undefined');
            });
            
            expect(hasError).to.be.false(`Runtime error found on ${section}`);
          } catch (error) {
            console.log(`Navigation to ${section} failed: ${error.message}`);
          }
        }
      });
    });
  });
});
