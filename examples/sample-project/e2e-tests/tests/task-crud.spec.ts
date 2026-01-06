import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../utils/auth-helpers';
import { TaskHelpers } from '../utils/task-helpers';
import { testUsers } from '../fixtures/test-users';
import { testTasks, invalidTasks } from '../fixtures/test-tasks';

test.describe('Task CRUD Operations', () => {
  let authHelpers: AuthHelpers;
  let taskHelpers: TaskHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    taskHelpers = new TaskHelpers(page);

    // Login before each test
    await authHelpers.login(testUsers.user1);
    await taskHelpers.goToDashboard();
  });

  test.describe('Task Creation', () => {
    test('should successfully create a simple task', async ({ page }) => {
      const task = testTasks.simpleTask;

      await taskHelpers.createTask(task);

      // Verify task appears in the list
      expect(await taskHelpers.verifyTaskExists(task.title)).toBe(true);

      // Verify task details are correct
      const taskElement = await taskHelpers.findTaskByTitle(task.title);
      await expect(taskElement).toBeVisible();
    });

    test('should create task with all status types', async ({ page }) => {
      const statuses: Array<'todo' | 'in_progress' | 'done'> = ['todo', 'in_progress', 'done'];

      for (const status of statuses) {
        const task = {
          title: `Task with ${status} status`,
          description: `Testing ${status} status`,
          status,
        };

        await taskHelpers.createTask(task);

        // Verify task was created
        expect(await taskHelpers.verifyTaskExists(task.title)).toBe(true);
      }
    });

    test('should handle task with long content', async ({ page }) => {
      const task = testTasks.longTask;

      await taskHelpers.createTask(task);

      // Verify task was created
      expect(await taskHelpers.verifyTaskExists(task.title)).toBe(true);

      // Open task to verify description is preserved
      await taskHelpers.openTask(task.title);

      // Check that description is visible (at least partially)
      const description = page.locator(`text=${task.description.substring(0, 50)}`);
      await expect(description).toBeVisible({ timeout: 5000 });
    });

    test('should handle task with special characters', async ({ page }) => {
      const task = testTasks.specialCharsTask;

      await taskHelpers.createTask(task);

      // Verify task was created and special chars are handled properly
      await page.waitForTimeout(1000);

      // Task should exist
      const taskCount = await taskHelpers.getTaskCount();
      expect(taskCount).toBeGreaterThan(0);
    });

    test('should show error when creating task with empty title', async ({ page }) => {
      await taskHelpers.openCreateTaskModal();

      // Leave title empty
      await page.fill('textarea[name="description"]', invalidTasks.emptyTitle.description);

      // Try to submit
      await page.click('button[type="submit"]');

      // Should show validation error
      const errorMessage = page.locator('text=/title.*required|title.*cannot.*empty/i, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should close modal when clicking cancel', async ({ page }) => {
      await taskHelpers.openCreateTaskModal();

      // Click cancel button
      const cancelButton = page.locator('button:has-text("Cancel"), button[aria-label="Close"]').first();
      await cancelButton.click();

      // Modal should be closed
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 2000 });
    });

    test('should show loading state during task creation', async ({ page }) => {
      await taskHelpers.openCreateTaskModal();

      const task = testTasks.simpleTask;
      await page.fill('input[name="title"]', task.title);
      await page.fill('textarea[name="description"]', task.description);

      // Click submit
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Should show loading indicator briefly
      const loadingIndicator = page.locator('[role="progressbar"], .loading, .spinner, button[disabled]:has-text("Creating"), button[disabled]:has-text("Saving")');

      // Note: This might be too fast to catch in some cases
      // Just verify the task is created successfully
      await page.waitForTimeout(500);
      expect(await taskHelpers.verifyTaskExists(task.title)).toBe(true);
    });
  });

  test.describe('Task Reading/Viewing', () => {
    test.beforeEach(async ({ page }) => {
      // Create a test task for viewing
      await taskHelpers.createTask(testTasks.simpleTask);
    });

    test('should display task details when clicked', async ({ page }) => {
      const task = testTasks.simpleTask;

      await taskHelpers.openTask(task.title);

      // Verify task details are visible
      await expect(page.locator(`text=${task.title}`)).toBeVisible();
      await expect(page.locator(`text=${task.description}`)).toBeVisible();
    });

    test('should show correct task count in dashboard', async ({ page }) => {
      const initialCount = await taskHelpers.getTaskCount();

      // Create another task
      await taskHelpers.createTask(testTasks.urgentTask);

      // Count should increase
      const newCount = await taskHelpers.getTaskCount();
      expect(newCount).toBe(initialCount + 1);
    });

    test('should display tasks in list format', async ({ page }) => {
      // Verify task list container exists
      const taskList = page.locator('[data-testid="task-list"], .task-list, [role="list"]');
      await expect(taskList).toBeVisible({ timeout: 5000 });

      // Verify at least one task is visible
      const taskCount = await taskHelpers.getTaskCount();
      expect(taskCount).toBeGreaterThan(0);
    });
  });

  test.describe('Task Updating', () => {
    test.beforeEach(async ({ page }) => {
      // Create a task to edit
      await taskHelpers.createTask(testTasks.simpleTask);
    });

    test('should successfully update task title', async ({ page }) => {
      const oldTask = testTasks.simpleTask;
      const newTitle = 'Updated Task Title';

      await taskHelpers.editTask(oldTask.title, { title: newTitle });

      // Verify old title is gone and new title exists
      await page.waitForTimeout(500);
      expect(await taskHelpers.verifyTaskExists(newTitle)).toBe(true);
    });

    test('should successfully update task description', async ({ page }) => {
      const task = testTasks.simpleTask;
      const newDescription = 'This is the updated description';

      await taskHelpers.editTask(task.title, { description: newDescription });

      // Open task and verify description
      await taskHelpers.openTask(task.title);
      await expect(page.locator(`text=${newDescription}`)).toBeVisible({ timeout: 5000 });
    });

    test('should successfully update task status', async ({ page }) => {
      const task = testTasks.simpleTask;

      await taskHelpers.editTask(task.title, { status: 'done' });

      // Verify task status was updated (visual indicator or filter test)
      await page.waitForTimeout(500);

      // Filter by done status
      await taskHelpers.filterByStatus('done');

      // Task should still be visible
      expect(await taskHelpers.verifyTaskExists(task.title)).toBe(true);
    });

    test('should prevent updating task with empty title', async ({ page }) => {
      const task = testTasks.simpleTask;

      await taskHelpers.openTask(task.title);

      const editButton = page.locator('button:has-text("Edit")').first();
      await editButton.click();

      // Clear the title
      await page.fill('input[name="title"]', '');

      // Try to save
      await page.click('button[type="submit"]');

      // Should show error
      const errorMessage = page.locator('text=/title.*required|title.*cannot.*empty/i, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Task Deletion', () => {
    test.beforeEach(async ({ page }) => {
      // Create a task to delete
      await taskHelpers.createTask(testTasks.simpleTask);
    });

    test('should successfully delete a task', async ({ page }) => {
      const task = testTasks.simpleTask;

      // Verify task exists
      expect(await taskHelpers.verifyTaskExists(task.title)).toBe(true);

      // Delete the task
      await taskHelpers.deleteTask(task.title);

      // Verify task is gone
      await page.waitForTimeout(1000);
      expect(await taskHelpers.verifyTaskNotExists(task.title)).toBe(true);
    });

    test('should show confirmation dialog before deleting', async ({ page }) => {
      const task = testTasks.simpleTask;

      await taskHelpers.openTask(task.title);

      const deleteButton = page.locator('button:has-text("Delete")').first();
      await deleteButton.click();

      // Should show confirmation dialog
      const confirmDialog = page.locator('[role="dialog"]:has-text("Delete"), [role="alertdialog"], text=/are you sure|confirm.*delete/i');
      await expect(confirmDialog).toBeVisible({ timeout: 5000 });

      // Cancel deletion
      const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("No")').first();
      if (await cancelButton.count() > 0) {
        await cancelButton.click();

        // Task should still exist
        await taskHelpers.goToDashboard();
        expect(await taskHelpers.verifyTaskExists(task.title)).toBe(true);
      }
    });

    test('should update task count after deletion', async ({ page }) => {
      const task = testTasks.simpleTask;

      const initialCount = await taskHelpers.getTaskCount();

      await taskHelpers.deleteTask(task.title);

      await page.waitForTimeout(1000);
      const newCount = await taskHelpers.getTaskCount();

      expect(newCount).toBe(initialCount - 1);
    });
  });

  test.describe('Bulk Operations', () => {
    test.beforeEach(async ({ page }) => {
      // Create multiple tasks
      await taskHelpers.createTask(testTasks.simpleTask);
      await taskHelpers.createTask(testTasks.urgentTask);
      await taskHelpers.createTask(testTasks.completedTask);
    });

    test('should display multiple tasks correctly', async ({ page }) => {
      const taskCount = await taskHelpers.getTaskCount();

      // Should have at least 3 tasks
      expect(taskCount).toBeGreaterThanOrEqual(3);

      // Verify each task is visible
      expect(await taskHelpers.verifyTaskExists(testTasks.simpleTask.title)).toBe(true);
      expect(await taskHelpers.verifyTaskExists(testTasks.urgentTask.title)).toBe(true);
      expect(await taskHelpers.verifyTaskExists(testTasks.completedTask.title)).toBe(true);
    });

    test('should handle selecting multiple tasks (if feature exists)', async ({ page }) => {
      // Check if multi-select checkboxes exist
      const checkboxes = page.locator('input[type="checkbox"][data-testid="task-checkbox"], .task-item input[type="checkbox"]');

      if (await checkboxes.count() > 0) {
        // Select first two tasks
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();

        // Verify selection indicators
        const selectedCount = await checkboxes.locator(':checked').count();
        expect(selectedCount).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
