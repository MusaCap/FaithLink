'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Plus, Search, Filter, Edit, Trash2, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { taskService, Task, TaskFilters } from '../../services/taskService';
import TaskCreateForm from '../../components/tasks/TaskCreateForm';
import Link from 'next/link';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [totalTasks, setTotalTasks] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [searchQuery, statusFilter, priorityFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: TaskFilters = {
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter as Task['status'] : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter as Task['priority'] : undefined,
        sortBy: 'dueDate',
        sortOrder: 'asc',
        limit: 50
      };

      const response = await taskService.getTasks(filters);
      setTasks(response.tasks || []);
      setTotalTasks(response.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await taskService.updateTask({ id: taskId, status: newStatus });
      await loadTasks(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.deleteTask(taskId);
      await loadTasks(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  // Mock data for fallback
  useEffect(() => {
    if (tasks.length === 0 && !loading && !error) {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Update member directory',
          description: 'Review and update contact information for all members',
          priority: 'high',
          status: 'pending',
          assignedTo: 'Admin User',
          dueDate: '2025-09-15',
          createdAt: '2025-09-01T00:00:00Z',
          category: 'Administration',
          createdBy: 'Admin User'
        },
        {
          id: '2',
          title: 'Prepare youth event',
          description: 'Plan activities and coordinate volunteers for upcoming youth retreat',
          priority: 'medium',
          status: 'in_progress',
          assignedTo: 'Pastor Smith',
          dueDate: '2025-09-20',
          createdAt: '2025-09-05T00:00:00Z',
          category: 'Events',
          createdBy: 'Pastor Smith'
        },
        {
          id: '3',
          title: 'Review group attendance',
          description: 'Analyze attendance patterns and reach out to inactive members',
          priority: 'medium',
          status: 'completed',
          assignedTo: 'Group Leader',
          dueDate: '2025-09-10',
          createdAt: '2025-08-28T00:00:00Z',
          category: 'Groups',
          createdBy: 'Group Leader'
        }
      ];
      
      setTimeout(() => {
        setTasks(mockTasks);
        setLoading(false);
      }, 500);
    }
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks & Action Items</h1>
          <p className="text-gray-600">Manage and track administrative tasks</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(task.status)}
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{task.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {task.assignedTo && (
                    <span>Assigned to: <span className="font-medium text-gray-700">{task.assignedTo}</span></span>
                  )}
                  {task.dueDate && (
                    <span>Due: <span className="font-medium text-gray-700">{new Date(task.dueDate).toLocaleDateString()}</span></span>
                  )}
                  <span>Category: <span className="font-medium text-gray-700">{task.category}</span></span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button className="text-gray-400 hover:text-gray-600 p-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <TaskCreateForm
            onCancel={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              loadTasks(); // Refresh the task list
            }}
          />
        </div>
      )}
    </div>
  );
}
