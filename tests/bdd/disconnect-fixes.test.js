/**
 * FaithLink360 Frontend↔Backend Disconnect Fixes — BDD Test Suite
 * Following Semantic Seed Venture Studio Coding Standards V2.0
 *
 * Tests all endpoints that were fixed/added during the disconnect-fix effort:
 *   - Volunteer alias routes (/api/volunteers/opportunities, /api/volunteers/my-signups)
 *   - Communications (announcements CRUD, campaigns GET)
 *   - Dashboard stats (/api/reports/dashboard-stats)
 *   - Tasks CRUD
 *   - Journey templates
 *   - Events
 *   - Settings
 *   - Care / prayer requests
 *   - Members
 *   - Bug report (de-duplicated)
 *   - Activity feed
 */

const axios = require('axios');
const { expect } = require('chai');

const BASE_URL = 'http://localhost:8000';

describe('FaithLink360 Disconnect-Fix Regression Suite', function () {
  this.timeout(10000);

  // ------------------------------------------------------------------
  // Volunteer alias routes (new)
  // ------------------------------------------------------------------
  describe('Volunteer Alias Routes', () => {
    it('should return opportunities via /api/volunteers/opportunities', async () => {
      const res = await axios.get(`${BASE_URL}/api/volunteers/opportunities`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
      expect(res.data.opportunities).to.be.an('array');
      expect(res.data.total).to.be.a('number');
    });

    it('should return signups via /api/volunteers/my-signups', async () => {
      const res = await axios.get(`${BASE_URL}/api/volunteers/my-signups`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
      expect(res.data.signups).to.be.an('array');
    });

    it('should still serve /api/volunteer-opportunities (original route)', async () => {
      const res = await axios.get(`${BASE_URL}/api/volunteer-opportunities`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
      expect(res.data.opportunities).to.be.an('array');
    });

    it('should accept volunteer signup via POST /api/volunteers/signup', async () => {
      const res = await axios.post(`${BASE_URL}/api/volunteers/signup`, {
        opportunityId: 'opp-1',
        memberId: '1',
        availabilityDays: ['Sunday'],
        skills: ['hospitality'],
        notes: 'BDD test signup'
      });
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.data.success).to.equal(true);
    });
  });

  // ------------------------------------------------------------------
  // Communications
  // ------------------------------------------------------------------
  describe('Communications', () => {
    it('should GET /api/communications/announcements from in-memory store', async () => {
      const res = await axios.get(`${BASE_URL}/api/communications/announcements`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
      expect(res.data.announcements).to.be.an('array');
      expect(res.data.count).to.be.a('number');
    });

    it('should GET /api/communications/campaigns from in-memory store', async () => {
      const res = await axios.get(`${BASE_URL}/api/communications/campaigns`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
      expect(res.data.campaigns).to.be.an('array');
    });

    it('should POST /api/communications/announcements to create an announcement', async () => {
      const res = await axios.post(`${BASE_URL}/api/communications/announcements`, {
        title: 'Test Announcement',
        content: 'This is a test announcement.',
        priority: 'normal',
        category: 'general'
      });
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.data.success).to.equal(true);
    });
  });

  // ------------------------------------------------------------------
  // Dashboard stats (fixed endpoint path)
  // ------------------------------------------------------------------
  describe('Dashboard Stats', () => {
    it('should GET /api/reports/dashboard-stats with all required fields', async () => {
      const res = await axios.get(`${BASE_URL}/api/reports/dashboard-stats`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);

      const stats = res.data.stats;
      expect(stats).to.be.an('object');
      expect(stats).to.have.property('totalMembers');
      expect(stats).to.have.property('activeGroups');
      expect(stats).to.have.property('avgAttendance');
      expect(stats).to.have.property('memberGrowth');
      expect(stats).to.have.property('attendanceGrowth');
      expect(stats).to.have.property('engagementScore');
    });
  });

  // ------------------------------------------------------------------
  // Tasks CRUD
  // ------------------------------------------------------------------
  describe('Tasks', () => {
    it('should GET /api/tasks', async () => {
      const res = await axios.get(`${BASE_URL}/api/tasks`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
      expect(res.data.tasks).to.be.an('array');
    });

    it('should POST /api/tasks to create a task', async () => {
      const res = await axios.post(`${BASE_URL}/api/tasks`, {
        title: 'BDD Test Task',
        description: 'Created by BDD test',
        priority: 'medium',
        category: 'administrative',
        createdBy: 'test'
      });
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.data.success).to.equal(true);
      expect(res.data.task).to.have.property('id');
    });

    it('should PUT /api/tasks/:id to update a task', async () => {
      const res = await axios.put(`${BASE_URL}/api/tasks/task-1`, {
        status: 'in_progress'
      });
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
    });
  });

  // ------------------------------------------------------------------
  // Journey Templates
  // ------------------------------------------------------------------
  describe('Journey Templates', () => {
    it('should GET /api/journey-templates', async () => {
      const res = await axios.get(`${BASE_URL}/api/journey-templates`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
      expect(res.data.templates).to.be.an('array');
    });

    it('should GET /api/journeys/member-journeys', async () => {
      const res = await axios.get(`${BASE_URL}/api/journeys/member-journeys`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
    });
  });

  // ------------------------------------------------------------------
  // Events
  // ------------------------------------------------------------------
  describe('Events', () => {
    it('should GET /api/events', async () => {
      const res = await axios.get(`${BASE_URL}/api/events`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
      expect(res.data.events).to.be.an('array');
    });

    it('should POST /api/events to create an event', async () => {
      const res = await axios.post(`${BASE_URL}/api/events`, {
        title: 'BDD Test Event',
        description: 'Created by BDD test',
        startDateTime: new Date().toISOString(),
        endDateTime: new Date(Date.now() + 3600000).toISOString(),
        location: 'Test Room'
      });
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.data.success).to.equal(true);
    });
  });

  // ------------------------------------------------------------------
  // Settings
  // ------------------------------------------------------------------
  describe('Settings', () => {
    it('should GET /api/settings/church', async () => {
      const res = await axios.get(`${BASE_URL}/api/settings/church`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
      expect(res.data.settings).to.have.property('name');
    });
  });

  // ------------------------------------------------------------------
  // Care / Prayer Requests
  // ------------------------------------------------------------------
  describe('Pastoral Care', () => {
    it('should GET /api/care/prayer-requests', async () => {
      const res = await axios.get(`${BASE_URL}/api/care/prayer-requests`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
      expect(res.data.prayerRequests).to.be.an('array');
    });

    it('should POST /api/care/counseling-sessions', async () => {
      const res = await axios.post(`${BASE_URL}/api/care/counseling-sessions`, {
        memberName: 'Test Member',
        counselorName: 'Pastor David',
        sessionType: 'individual',
        sessionDate: '2026-04-01',
        sessionTime: '10:00',
        duration: 60
      });
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.data.success).to.equal(true);
    });
  });

  // ------------------------------------------------------------------
  // Members
  // ------------------------------------------------------------------
  describe('Members', () => {
    it('should GET /api/members', async () => {
      const res = await axios.get(`${BASE_URL}/api/members`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
      expect(res.data.members).to.be.an('array');
    });
  });

  // ------------------------------------------------------------------
  // Bug Report (de-duplicated route)
  // ------------------------------------------------------------------
  describe('Bug Report', () => {
    it('should POST /api/bug-report and persist to inMemoryBugReports', async () => {
      const res = await axios.post(`${BASE_URL}/api/bug-report`, {
        title: 'BDD Test Bug',
        description: 'Submitted by BDD test suite',
        severity: 'low',
        page: '/test',
        steps: 'Run test'
      });
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.data.success).to.equal(true);
      expect(res.data.report).to.have.property('id');
      expect(res.data.report.severity).to.equal('low');
    });
  });

  // ------------------------------------------------------------------
  // Activity Feed
  // ------------------------------------------------------------------
  describe('Activity Feed', () => {
    it('should GET /api/activity', async () => {
      const res = await axios.get(`${BASE_URL}/api/activity`);
      expect(res.status).to.equal(200);
      expect(res.data.success).to.equal(true);
      expect(res.data.activities).to.be.an('array');
    });
  });

  // ------------------------------------------------------------------
  // Reports Export (fixed URL path order)
  // ------------------------------------------------------------------
  describe('Reports Export', () => {
    it('should GET /api/reports/export/members', async () => {
      const res = await axios.get(`${BASE_URL}/api/reports/export/members`);
      expect(res.status).to.equal(200);
    });
  });

  // ------------------------------------------------------------------
  // Health check
  // ------------------------------------------------------------------
  describe('Health', () => {
    it('should GET /health and return healthy', async () => {
      const res = await axios.get(`${BASE_URL}/health`);
      expect(res.status).to.equal(200);
      expect(res.data.status).to.equal('healthy');
    });
  });
});
