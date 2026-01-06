import { APIRequestContext } from '@playwright/test';

/**
 * API helper utilities for E2E tests
 * Useful for test setup and teardown
 */

export class ApiHelpers {
  private baseUrl: string;

  constructor(private request: APIRequestContext, baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Register a new user via API
   */
  async registerUser(email: string, password: string, name: string): Promise<string> {
    const response = await this.request.post(`${this.baseUrl}/api/auth/register`, {
      data: { email, password, name },
    });

    const body = await response.json();
    return body.data?.token || body.token;
  }

  /**
   * Login user via API
   */
  async loginUser(email: string, password: string): Promise<string> {
    const response = await this.request.post(`${this.baseUrl}/api/auth/login`, {
      data: { email, password },
    });

    const body = await response.json();
    return body.data?.token || body.token;
  }

  /**
   * Create a task via API
   */
  async createTask(token: string, task: { title: string; description: string; status?: string }) {
    const response = await this.request.post(`${this.baseUrl}/api/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      data: task,
    });

    return await response.json();
  }

  /**
   * Delete all tasks for a user via API
   */
  async deleteAllTasks(token: string) {
    const response = await this.request.get(`${this.baseUrl}/api/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const tasks = await response.json();
    const taskList = tasks.data || tasks;

    for (const task of taskList) {
      await this.request.delete(`${this.baseUrl}/api/tasks/${task.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  }

  /**
   * Delete a user via API (admin only)
   */
  async deleteUser(token: string, userId: string) {
    await this.request.delete(`${this.baseUrl}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request.get(`${this.baseUrl}/health`);
      return response.ok();
    } catch {
      return false;
    }
  }
}
