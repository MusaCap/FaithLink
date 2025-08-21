import React from 'react';
import { render } from '@testing-library/react';
import JourneyTemplateForm from '../JourneyTemplateForm';

// Mock the AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', role: 'admin' },
    loading: false
  })
}));

// Mock services
jest.mock('../../../services/journeyService', () => ({
  journeyService: {
    createJourneyTemplate: jest.fn(),
    updateJourneyTemplate: jest.fn()
  }
}));

describe('JourneyTemplateForm Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<JourneyTemplateForm />);
    expect(container).toBeTruthy();
  });
});
