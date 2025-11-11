/**
 * BDD-Style Comprehensive Platform Functionality Tests
 * Following Semantic Seed Venture Studio Coding Standards V2.0
 * Test-Driven Development (TDD) & Behavior-Driven Development (BDD)
 */

const { expect } = require('chai');
const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:8000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

describe('FaithLink360 Platform Functionality', () => {

  describe('Authentication Module', () => {
    describe('When user attempts to login', () => {
      it('should successfully authenticate with valid credentials', async () => {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: 'admin@faithlink360.org',
          password: 'admin123'
        });
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.token).to.exist;
        expect(response.data.user.role).to.equal('admin');
      });

      it('should reject authentication with invalid credentials', async () => {
        try {
          await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'invalid@test.com',
            password: 'wrongpassword'
          });
        } catch (error) {
          expect(error.response.status).to.equal(401);
          expect(error.response.data.success).to.be.false;
        }
      });

      it('should handle logout successfully', async () => {
        const response = await axios.post(`${BASE_URL}/api/auth/logout`);
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
      });
    });
  });

  describe('Member Management Module', () => {
    describe('When fetching members list', () => {
      it('should return members with proper structure', async () => {
        const response = await axios.get(`${BASE_URL}/api/members`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.members).to.be.an('array');
        
        if (response.data.members.length > 0) {
          const member = response.data.members[0];
          expect(member).to.have.property('id');
          expect(member).to.have.property('firstName');
          expect(member).to.have.property('lastName');
          expect(member).to.have.property('email');
          expect(member).to.have.property('memberNumber');
        }
      });

      it('should return member statistics', async () => {
        const response = await axios.get(`${BASE_URL}/api/members/stats`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.stats).to.have.property('totalMembers');
        expect(response.data.stats).to.have.property('activeMembers');
        expect(response.data.stats.totalMembers).to.be.a('number');
      });

      it('should return individual member details', async () => {
        const response = await axios.get(`${BASE_URL}/api/members/1`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.member).to.have.property('id');
        expect(response.data.member).to.have.property('firstName');
        expect(response.data.member).to.have.property('lastName');
      });
    });

    describe('When managing member tags', () => {
      it('should return available member tags', async () => {
        const response = await axios.get(`${BASE_URL}/api/members/tags`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.tags).to.be.an('array');
      });
    });
  });

  describe('Deacon Assignment Module', () => {
    describe('When fetching deacons', () => {
      it('should return deacons list for dropdown selection', async () => {
        const response = await axios.get(`${BASE_URL}/api/deacons/dropdown`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.deacons).to.be.an('array');
        
        if (response.data.deacons.length > 0) {
          const deacon = response.data.deacons[0];
          expect(deacon).to.have.property('id');
          expect(deacon).to.have.property('name');
          expect(deacon).to.have.property('specialties');
        }
      });

      it('should return individual deacon details', async () => {
        const response = await axios.get(`${BASE_URL}/api/deacons/1`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.deacon).to.have.property('id');
        expect(response.data.deacon).to.have.property('name');
        expect(response.data.deacon).to.have.property('contactInfo');
      });
    });
  });

  describe('Groups Module', () => {
    describe('When managing groups', () => {
      it('should return groups list with proper structure', async () => {
        const response = await axios.get(`${BASE_URL}/api/groups`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.groups).to.be.an('array');
      });

      it('should return group statistics', async () => {
        const response = await axios.get(`${BASE_URL}/api/groups/stats`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.stats).to.have.property('totalGroups');
      });
    });
  });

  describe('Events Module', () => {
    describe('When managing events', () => {
      it('should return events list', async () => {
        const response = await axios.get(`${BASE_URL}/api/events`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.events).to.be.an('array');
      });

      it('should return individual event details', async () => {
        const response = await axios.get(`${BASE_URL}/api/events/1`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.event).to.have.property('id');
        expect(response.data.event).to.have.property('title');
      });

      it('should handle event registrations', async () => {
        const response = await axios.get(`${BASE_URL}/api/events/1/registrations`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.registrations).to.be.an('array');
      });
    });
  });

  describe('Journey Templates Module', () => {
    describe('When managing journey templates', () => {
      it('should return journey templates with milestones', async () => {
        const response = await axios.get(`${BASE_URL}/api/journeys/templates`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.templates).to.be.an('array');
        
        if (response.data.templates.length > 0) {
          const template = response.data.templates[0];
          expect(template).to.have.property('id');
          expect(template).to.have.property('title');
          expect(template).to.have.property('milestones');
          expect(template.milestones).to.be.an('array');
        }
      });

      it('should return member journeys', async () => {
        const response = await axios.get(`${BASE_URL}/api/journeys/member-journeys`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.journeys).to.be.an('array');
      });
    });
  });

  describe('Pastoral Care Module', () => {
    describe('When managing pastoral care', () => {
      it('should return prayer requests', async () => {
        const response = await axios.get(`${BASE_URL}/api/care/prayer-requests`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.prayerRequests).to.be.an('array');
      });

      it('should return care records', async () => {
        const response = await axios.get(`${BASE_URL}/api/care/records`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.records).to.be.an('array');
      });

      it('should return members needing care', async () => {
        const response = await axios.get(`${BASE_URL}/api/care/members-needing-care`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.members).to.be.an('array');
      });
    });
  });

  describe('Communications Module', () => {
    describe('When managing communications', () => {
      it('should return communication campaigns', async () => {
        const response = await axios.get(`${BASE_URL}/api/communications/campaigns`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.campaigns).to.be.an('array');
      });

      it('should return announcements', async () => {
        const response = await axios.get(`${BASE_URL}/api/communications/announcements`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.announcements).to.be.an('array');
      });
    });
  });

  describe('Reports Module', () => {
    describe('When generating reports', () => {
      it('should return dashboard statistics', async () => {
        const response = await axios.get(`${BASE_URL}/api/dashboard/stats`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.stats).to.have.property('members');
        expect(response.data.stats).to.have.property('groups');
        expect(response.data.stats).to.have.property('events');
      });

      it('should return attendance reports', async () => {
        const response = await axios.get(`${BASE_URL}/api/reports/attendance`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.report).to.have.property('summary');
      });

      it('should return engagement reports', async () => {
        const response = await axios.get(`${BASE_URL}/api/reports/engagement`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.report).to.have.property('memberEngagement');
      });
    });
  });

  describe('Task Management Module', () => {
    describe('When managing tasks', () => {
      it('should return tasks list', async () => {
        const response = await axios.get(`${BASE_URL}/api/tasks`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.tasks).to.be.an('array');
      });

      it('should return individual task details', async () => {
        const response = await axios.get(`${BASE_URL}/api/tasks/1`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.task).to.have.property('id');
        expect(response.data.task).to.have.property('title');
      });
    });
  });

  describe('Settings Module', () => {
    describe('When managing settings', () => {
      it('should return user settings', async () => {
        const response = await axios.get(`${BASE_URL}/api/settings/users`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.users).to.be.an('array');
      });

      it('should return church settings', async () => {
        const response = await axios.get(`${BASE_URL}/api/settings/church`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.settings).to.have.property('name');
      });
    });
  });

  describe('System Health Module', () => {
    describe('When checking system health', () => {
      it('should return health status', async () => {
        const response = await axios.get(`${BASE_URL}/health`);
        
        expect(response.status).to.equal(200);
        expect(response.data.status).to.equal('healthy');
        expect(response.data.timestamp).to.exist;
      });

      it('should return system information', async () => {
        const response = await axios.get(`${BASE_URL}/api/info`);
        
        expect(response.status).to.equal(200);
        expect(response.data.name).to.equal('FaithLink360 Backend');
        expect(response.data.version).to.exist;
      });
    });
  });

  describe('Activity Tracking Module', () => {
    describe('When tracking activities', () => {
      it('should return activity feed', async () => {
        const response = await axios.get(`${BASE_URL}/api/activity`);
        
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.activities).to.be.an('array');
      });
    });
  });
});
