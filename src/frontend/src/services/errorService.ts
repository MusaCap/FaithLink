// Enhanced Error Handling Service for Production
// Provides clear error messages and automatic bug reporting

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
  timestamp: string;
  userId?: string;
  churchId?: string;
}

export interface ErrorReport {
  error: AppError;
  stackTrace?: string;
  userAgent: string;
  url: string;
  viewport: { width: number; height: number };
  timestamp: string;
}

class ErrorService {
  private static instance: ErrorService;
  private errorQueue: ErrorReport[] = [];
  private isOnline: boolean = navigator.onLine;

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  constructor() {
    // Listen for network changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Global error handler for unhandled errors
    window.addEventListener('error', (event) => {
      this.handleUnhandledError(event.error, 'JavaScript Error', event.filename, event.lineno);
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledError(event.reason, 'Unhandled Promise Rejection');
    });
  }

  // Enhanced error categorization
  categorizeError(error: any): AppError {
    const timestamp = new Date().toISOString();
    const context = this.getErrorContext();

    // Network Errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
        userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
        severity: 'high',
        context,
        timestamp
      };
    }

    // CORS Errors
    if (error.message && error.message.includes('CORS')) {
      return {
        code: 'CORS_ERROR',
        message: 'Cross-origin request blocked',
        userMessage: 'There was a connection issue with our servers. Please refresh the page and try again.',
        severity: 'high',
        context,
        timestamp
      };
    }

    // Authentication Errors
    if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
      return {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
        userMessage: 'Your session has expired. Please log in again.',
        severity: 'medium',
        context,
        timestamp
      };
    }

    // Permission Errors
    if (error.message && (error.message.includes('403') || error.message.includes('Forbidden'))) {
      return {
        code: 'PERMISSION_ERROR',
        message: 'Access denied',
        userMessage: 'You don\'t have permission to perform this action. Please contact your administrator.',
        severity: 'medium',
        context,
        timestamp
      };
    }

    // Validation Errors
    if (error.message && error.message.includes('400')) {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        userMessage: 'Please check your input and try again. Some required fields may be missing.',
        severity: 'low',
        context,
        timestamp
      };
    }

    // Server Errors
    if (error.message && (error.message.includes('500') || error.message.includes('Internal Server Error'))) {
      return {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
        userMessage: 'Our servers are experiencing issues. Please try again in a few minutes.',
        severity: 'critical',
        context,
        timestamp
      };
    }

    // Generic Error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred',
      userMessage: 'Something unexpected happened. Please try again or contact support if the issue persists.',
      severity: 'medium',
      context: { ...context, originalError: error },
      timestamp
    };
  }

  // Handle and report errors
  async handleError(error: any, context?: string): Promise<AppError> {
    const appError = this.categorizeError(error);
    
    // Add user context if available
    const user = this.getCurrentUser();
    if (user) {
      appError.userId = user.id;
      appError.churchId = user.churchId;
    }

    // Log error for debugging
    console.error('🚨 Application Error:', appError);

    // Report error if it's significant
    if (appError.severity === 'high' || appError.severity === 'critical') {
      await this.reportError(appError, error);
    }

    return appError;
  }

  // Automatic error reporting
  private async reportError(appError: AppError, originalError?: any): Promise<void> {
    const errorReport: ErrorReport = {
      error: appError,
      stackTrace: originalError?.stack || new Error().stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timestamp: new Date().toISOString()
    };

    if (this.isOnline) {
      try {
        await this.sendErrorReport(errorReport);
      } catch (err) {
        console.error('Failed to send error report:', err);
        this.errorQueue.push(errorReport);
      }
    } else {
      this.errorQueue.push(errorReport);
    }
  }

  // Send error report to backend
  private async sendErrorReport(errorReport: ErrorReport): Promise<void> {
    await fetch('/api/error-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        title: `${errorReport.error.code}: ${errorReport.error.message}`,
        description: errorReport.error.userMessage,
        severity: errorReport.error.severity,
        category: 'automatic',
        userEmail: this.getCurrentUser()?.email || 'anonymous',
        userId: errorReport.error.userId,
        churchId: errorReport.error.churchId,
        browserInfo: errorReport.userAgent,
        stackTrace: errorReport.stackTrace,
        url: errorReport.url,
        viewport: errorReport.viewport,
        timestamp: errorReport.timestamp,
        context: errorReport.error.context
      })
    });
  }

  // Handle unhandled errors
  private handleUnhandledError(error: any, type: string, filename?: string, lineno?: number): void {
    const context = {
      type,
      filename,
      lineno,
      automatic: true
    };
    
    this.handleError(error, JSON.stringify(context));
  }

  // Get current error context
  private getErrorContext(): any {
    return {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      language: navigator.language
    };
  }

  // Get current user from auth context
  private getCurrentUser(): any {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      
      // You might want to decode the token or get user from a global state
      // For now, return null and let the component pass user context
      return null;
    } catch {
      return null;
    }
  }

  // Flush queued errors when back online
  private async flushErrorQueue(): Promise<void> {
    while (this.errorQueue.length > 0 && this.isOnline) {
      const errorReport = this.errorQueue.shift();
      if (errorReport) {
        try {
          await this.sendErrorReport(errorReport);
        } catch (err) {
          // Put it back at the front of the queue
          this.errorQueue.unshift(errorReport);
          break;
        }
      }
    }
  }

  // Manual error reporting with user feedback
  async reportUserError(
    title: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    const user = this.getCurrentUser();
    
    await fetch('/api/bug-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        title,
        description,
        severity,
        category: 'user_reported',
        userEmail: user?.email || 'anonymous',
        userId: user?.id,
        churchId: user?.churchId,
        browserInfo: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      })
    });
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance();

// Enhanced fetch wrapper with better error handling
export async function enhancedFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      throw error;
    }
    
    return response;
  } catch (error) {
    const appError = await errorService.handleError(error, `Fetch request to ${url}`);
    throw appError;
  }
}

// Hook for React components to handle errors
export function useErrorHandler() {
  return {
    handleError: (error: any, context?: string) => errorService.handleError(error, context),
    reportError: (title: string, description: string, severity?: 'low' | 'medium' | 'high' | 'critical') => 
      errorService.reportUserError(title, description, severity)
  };
}
