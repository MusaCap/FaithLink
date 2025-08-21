'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types/auth';

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  loginAsDemo: (role: 'admin' | 'pastor' | 'group_leader' | 'member') => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemoMode = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoProvider');
  }
  return context;
};

interface DemoProviderProps {
  children: ReactNode;
}

export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
  };

  const loginAsDemo = (role: 'admin' | 'pastor' | 'group_leader' | 'member') => {
    const demoUsers: Record<string, User> = {
      admin: {
        id: 'demo-admin-1',
        email: 'admin@faithlink360.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      pastor: {
        id: 'demo-pastor-1',
        email: 'pastor@faithlink360.com',
        firstName: 'Pastor',
        lastName: 'Smith',
        role: 'pastor',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      group_leader: {
        id: 'demo-leader-1',
        email: 'leader@faithlink360.com',
        firstName: 'Group',
        lastName: 'Leader',
        role: 'group_leader',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      member: {
        id: 'demo-member-1',
        email: 'member@faithlink360.com',
        firstName: 'Church',
        lastName: 'Member',
        role: 'member',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    const user = demoUsers[role];
    const token = `demo-token-${role}-${Date.now()}`;
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Trigger auth context refresh
    window.dispatchEvent(new Event('storage'));
    window.location.reload();
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, setDemoMode, loginAsDemo }}>
      {children}
    </DemoContext.Provider>
  );
};
