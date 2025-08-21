import React from 'react';
import { render } from '@testing-library/react';
import AttendanceForm from '../AttendanceForm';

// Mock the AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', role: 'admin' },
    login: jest.fn(),
    logout: jest.fn(),
    loading: false
  })
}));

// Mock services
jest.mock('../../../services/attendanceService', () => ({
  attendanceService: {
    createAttendanceSession: jest.fn()
  }
}));

jest.mock('../../../services/groupService', () => ({
  groupService: {
    getGroupMembers: jest.fn().mockResolvedValue([])
  }
}));

describe('AttendanceForm Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<AttendanceForm groupId="group-1" />);
    expect(container).toBeTruthy();
  });
});
