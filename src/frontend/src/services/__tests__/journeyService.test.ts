import { journeyService } from '../journeyService';

// Mock fetch globally
global.fetch = jest.fn();

describe('JourneyService', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('basic functionality', () => {
    it('should exist and be callable', () => {
      expect(journeyService).toBeDefined();
      expect(typeof journeyService.getJourneyTemplates).toBe('function');
    });
  });
});
