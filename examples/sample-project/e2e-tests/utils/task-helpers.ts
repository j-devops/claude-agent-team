import { Page, expect } from '@playwright/test';
import { TestTask } from '../fixtures/test-tasks';

/**
 * Task management helper utilities for E2E tests
 */

export class TaskHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to tasks dashboard
   */
  async goToDashboard() {
    await this.page.goto('/dashboard');
    await expect(this.page).toHaveURL(/.*dashboard/);
  }

  /**
   * Open task creation modal/form
   */
  async openCreateTaskModal() {
    const createButton = this.page.locator('button:has-text("Create"), button:has-text("New Task"), button:has-text("Add Task")').first();
    await createButton.click();

    // Wait for modal to appear
    await this.page.waitForSelector('[role="dialog"], .modal, [data-testid="task-modal"]', { timeout: 5000 });
  }

  /**
   * Create a new task
   */
  async createTask(task: TestTask) {
    await this.openCreateTaskModal();

    // Fill in task details
    await this.page.fill('input[name="title"], [placeholder*="title" i]', task.title);
    await this.page.fill('textarea[name="description"], [placeholder*="description" i]', task.description);

    // Select status if dropdown exists
    const statusSelect = this.page.locator('select[name="status"]');
    if (await statusSelect.count() > 0) {
      await statusSelect.selectOption(task.status);
    }

    // Submit form
    const submitButton = this.page.locator('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")').first();
    await submitButton.click();

    // Wait for modal to close
    await this.page.waitForSelector('[role="dialog"], .modal, [data-testid="task-modal"]', { state: 'hidden', timeout: 5000 });
  }

  /**
   * Find task by title in the list
   */
  async findTaskByTitle(title: string) {
    return this.page.locator(`text=${title}`).first();
  }

  /**
   * Click on a task to view details
   */
  async openTask(title: string) {
    const task = await this.findTaskByTitle(title);
    await task.click();

    // Wait for task detail view
    await this.page.waitForTimeout(500);
  }

  /**
   * Edit a task
   */
  async editTask(oldTitle: string, updatedTask: Partial<TestTask>) {
    await this.openTask(oldTitle);

    // Look for edit button
    const editButton = this.page.locator('button:has-text("Edit")').first();
    await editButton.click();

    // Update fields
    if (updatedTask.title) {
      await this.page.fill('input[name="title"]', updatedTask.title);
    }
    if (updatedTask.description) {
      await this.page.fill('textarea[name="description"]', updatedTask.description);
    }
    if (updatedTask.status) {
      await this.page.selectOption('select[name="status"]', updatedTask.status);
    }

    // Save changes
    await this.page.click('button[type="submit"]:has-text("Save")');
    await this.page.waitForTimeout(500);
  }

  /**
   * Delete a task
   */
  async deleteTask(title: string) {
    await this.openTask(title);

    // Look for delete button
    const deleteButton = this.page.locator('button:has-text("Delete")').first();
    await deleteButton.click();

    // Confirm deletion if confirmation dialog appears
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
    if (await confirmButton.count() > 0) {
      await confirmButton.first().click();
    }

    await this.page.waitForTimeout(500);
  }

  /**
   * Filter tasks by status
   */
  async filterByStatus(status: 'todo' | 'in_progress' | 'done' | 'all') {
    const filterSelect = this.page.locator('select[name="status-filter"], select:has-text("Status")').first();
    await filterSelect.selectOption(status);
    await this.page.waitForTimeout(500);
  }

  /**
   * Search for tasks
   */
  async searchTasks(query: string) {
    const searchInput = this.page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  /**
   * Get count of visible tasks
   */
  async getTaskCount(): Promise<number> {
    const tasks = this.page.locator('[data-testid="task-item"], .task-item, [class*="task-card"]');
    return await tasks.count();
  }

  /**
   * Verify task exists in list
   */
  async verifyTaskExists(title: string): Promise<boolean> {
    const task = await this.findTaskByTitle(title);
    return await task.isVisible();
  }

  /**
   * Verify task does not exist in list
   */
  async verifyTaskNotExists(title: string): Promise<boolean> {
    const task = await this.findTaskByTitle(title);
    return !(await task.isVisible().catch(() => false));
  }
}
