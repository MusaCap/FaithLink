import React from 'react';
import { render } from '@testing-library/react';
import GroupForm from '../GroupForm';

// Mock the AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', role: 'admin' },
    loading: false
  })
}));

// Mock services
jest.mock('../../../services/groupService', () => ({
  groupService: {
    createGroup: jest.fn(),
    updateGroup: jest.fn()
  }
}));

describe('GroupForm Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<GroupForm />);
    expect(container).toBeTruthy();
  });
});
