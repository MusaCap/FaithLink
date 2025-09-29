const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  assignedToId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  category: string;
  createdBy: string;
}

export interface TaskCreateRequest {
  title: string;
  description: string;
  priority: Task['priority'];
  assignedTo?: string;
  assignedToId?: string;
  dueDate?: string;
  category: string;
}

export interface TaskUpdateRequest extends Partial<TaskCreateRequest> {
  id: string;
  status?: Task['status'];
}

export interface TaskFilters {
  status?: Task['status'];
  priority?: Task['priority'];
  assignedToId?: string;
  category?: string;
  search?: string;
  sortBy?: 'title' | 'dueDate' | 'priority' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TaskResponse {
  tasks: Task[];
  total: number;
}

class TaskService {
  private cache = new Map<string, any>();
  private readonly cacheKeys = {
    tasks: 'tasks_list',
    task: (id: string) => `task_${id}`,
  };

  private async request<T>(endpoint: string, options: RequestInit = {}, cacheKey?: string): Promise<T> {
    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache successful responses
    if (cacheKey && response.status === 200) {
      this.cache.set(cacheKey, data);
      // Auto-expire cache after 5 minutes
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
    }

    return data;
  }

  async getTasks(filters: TaskFilters = {}): Promise<TaskResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const cacheKey = `tasks_${params.toString()}`;
    return this.request<TaskResponse>(
      `/api/tasks?${params.toString()}`, 
      { method: 'GET' },
      cacheKey
    );
  }

  async getTask(taskId: string): Promise<Task> {
    const cacheKey = this.cacheKeys.task(taskId);
    return this.request<Task>(
      `/api/tasks/${taskId}`, 
      { method: 'GET' },
      cacheKey
    );
  }

  async createTask(data: TaskCreateRequest): Promise<Task> {
    const result = await this.request<Task>(
      '/api/tasks', 
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    // Invalidate tasks cache
    this.invalidateTaskCache();
    
    return result;
  }

  async updateTask(data: TaskUpdateRequest): Promise<Task> {
    const result = await this.request<Task>(
      `/api/tasks/${data.id}`, 
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    
    // Invalidate caches
    this.invalidateTaskCache();
    this.cache.delete(this.cacheKeys.task(data.id));
    
    return result;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.request<{ message: string }>(
      `/api/tasks/${taskId}`, 
      { method: 'DELETE' }
    );
    
    // Invalidate caches
    this.invalidateTaskCache();
    this.cache.delete(this.cacheKeys.task(taskId));
  }

  private invalidateTaskCache(): void {
    // Clear all task-related cache entries
    const cacheKeysToDelete: string[] = [];
    
    this.cache.forEach((_: any, key: string) => {
      if (key.startsWith('tasks_') || key === this.cacheKeys.tasks) {
        cacheKeysToDelete.push(key);
      }
    });
    
    cacheKeysToDelete.forEach(key => this.cache.delete(key));
  }

  // Utility methods
  getTaskPriorityColor(priority: Task['priority']): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTaskStatusColor(status: Task['status']): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  isTaskOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  }

  getTaskProgress(tasks: Task[]): {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
  } {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const overdue = tasks.filter(t => this.isTaskOverdue(t)).length;

    return { total, completed, pending, inProgress, overdue };
  }
}

export const taskService = new TaskService();
