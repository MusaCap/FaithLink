'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, UserPlus } from 'lucide-react';

interface FamilyMember {
  id: string;
  relationship: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhotoUrl?: string;
  };
  direction: string;
}

interface FamilyConnectionsProps {
  memberId: string;
}

export default function FamilyConnections({ memberId }: FamilyConnectionsProps) {
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [relationship, setRelationship] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchFamily();
  }, [memberId]);

  const fetchFamily = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/members/${memberId}/family`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setFamily(data.family || []);
    } catch (error) {
      console.error('Error fetching family:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.members) setAllMembers(data.members);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleAdd = async () => {
    if (!selectedMemberId || !relationship) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/members/${memberId}/family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ relatedId: selectedMemberId, relationship })
      });
      const data = await res.json();
      if (data.success) {
        await fetchFamily();
        setShowAddForm(false);
        setSelectedMemberId('');
        setRelationship('');
      }
    } catch (error) {
      console.error('Error adding family connection:', error);
    }
  };

  const handleRemove = async (connectionId: string) => {
    if (!confirm('Remove this family connection?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_URL}/api/members/${memberId}/family/${connectionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchFamily();
    } catch (error) {
      console.error('Error removing family connection:', error);
    }
  };

  if (loading) {
    return <div className="animate-pulse p-4 bg-gray-50 rounded-lg h-32"></div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Family Connections
        </h3>
        <button
          onClick={() => { setShowAddForm(true); fetchMembers(); }}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </button>
      </div>

      {family.length === 0 && !showAddForm && (
        <p className="text-gray-500 text-sm">No family connections recorded.</p>
      )}

      <div className="space-y-3">
        {family.map((f) => (
          <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                {f.member.firstName[0]}{f.member.lastName[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">{f.member.firstName} {f.member.lastName}</p>
                <p className="text-sm text-gray-500 capitalize">{f.relationship}</p>
              </div>
            </div>
            <button onClick={() => handleRemove(f.id)} className="text-red-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <UserPlus className="w-4 h-4 mr-2" /> Add Family Member
          </h4>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Select a member...</option>
            {allMembers.filter(m => m.id !== memberId).map(m => (
              <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
            ))}
          </select>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Select relationship...</option>
            <option value="spouse">Spouse</option>
            <option value="parent">Parent</option>
            <option value="child">Child</option>
            <option value="sibling">Sibling</option>
            <option value="grandparent">Grandparent</option>
            <option value="grandchild">Grandchild</option>
            <option value="other">Other</option>
          </select>
          <div className="flex space-x-2">
            <button onClick={handleAdd} disabled={!selectedMemberId || !relationship} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
              Save
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
