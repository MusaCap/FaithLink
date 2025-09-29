'use client';

import React, { useState } from 'react';
import BugReportModal from './BugReportModal';

export default function BugReportButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Bug Report Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
        title="Report a Bug"
      >
        <div className="flex items-center">
          <span className="text-xl">🐛</span>
          <span className="ml-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Report Bug
          </span>
        </div>
      </button>

      {/* Bug Report Modal */}
      <BugReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
