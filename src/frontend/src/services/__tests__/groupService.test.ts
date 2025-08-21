import { groupService } from '../groupService';

// Mock fetch globally
global.fetch = jest.fn();

describe('GroupService', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('basic functionality', () => {
    it('should exist and be callable', () => {
      expect(groupService).toBeDefined();
      expect(typeof groupService.getGroups).toBe('function');
    });
  });
});
