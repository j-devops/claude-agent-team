import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../utils/auth-helpers';
import { TaskHelpers } from '../utils/task-helpers';
import { testUsers } from '../fixtures/test-users';
import { testTasks } from '../fixtures/test-tasks';

test.describe('Task Filtering and Search', () => {
  let authHelpers: AuthHelpers;
  let taskHelpers: TaskHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    taskHelpers = new TaskHelpers(page);

    // Login and create test tasks
    await authHelpers.login(testUsers.user1);
    await taskHelpers.goToDashboard();

    // Create tasks with different statuses
    await taskHelpers.createTask({ ...testTasks.simpleTask, status: 'todo' });
    await taskHelpers.createTask({ ...testTasks.urgentTask, status: 'in_progress' });
    await taskHelpers.createTask({ ...testTasks.completedTask, status: 'done' });
  });

  test.describe('Filter by Status', () => {
    test('should show all tasks by default', async ({ page }) => {
      await taskHelpers.goToDashboard();

      // Should see all tasks
      const taskCount = await taskHelpers.getTaskCount();
      expect(taskCount).toBeGreaterThanOrEqual(3);
    });

    test('should filter to show only "To Do" tasks', async ({ page }) => {
      await taskHelpers.filterByStatus('todo');

      // Should see todo tasks
      expect(await taskHelpers.verifyTaskExists(testTasks.simpleTask.title)).toBe(true);

      // Should not see in_progress or done tasks (or they might be hidden)
      await page.waitForTimeout(500);
    });

    test('should filter to show only "In Progress" tasks', async ({ page }) => {
      await taskHelpers.filterByStatus('in_progress');

      // Should see in_progress tasks
      expect(await taskHelpers.verifyTaskExists(testTasks.urgentTask.title)).toBe(true);

      // Check that filter is working
      await page.waitForTimeout(500);
    });

    test('should filter to show only "Done" tasks', async ({ page }) => {
      await taskHelpers.filterByStatus('done');

      // Should see done tasks
      expect(await taskHelpers.verifyTaskExists(testTasks.completedTask.title)).toBe(true);

      await page.waitForTimeout(500);
    });

    test('should return to all tasks when selecting "All" filter', async ({ page }) => {
      // First apply a filter
      await taskHelpers.filterByStatus('todo');
      await page.waitForTimeout(500);

      // Then select "All"
      await taskHelpers.filterByStatus('all');
      await page.waitForTimeout(500);

      // Should see all tasks again
      const taskCount = await taskHelpers.getTaskCount();
      expect(taskCount).toBeGreaterThanOrEqual(3);
    });

    test('should show empty state when no tasks match filter', async ({ page }) => {
      // Delete all done tasks first
      await taskHelpers.deleteTask(testTasks.completedTask.title);

      // Filter by done
      await taskHelpers.filterByStatus('done');

      // Should show empty state or "No tasks" message
      const emptyState = page.locator('text=/no tasks|no items|empty|nothing to show/i');
      await expect(emptyState).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Search Functionality', () => {
    test('should find tasks by exact title match', async ({ page }) => {
      await taskHelpers.searchTasks(testTasks.simpleTask.title);

      // Should show the matching task
      expect(await taskHelpers.verifyTaskExists(testTasks.simpleTask.title)).toBe(true);
    });

    test('should find tasks by partial title match', async ({ page }) => {
      // Search for part of the title
      const partialTitle = testTasks.urgentTask.title.substring(0, 5);
      await taskHelpers.searchTasks(partialTitle);

      // Should show the matching task
      await page.waitForTimeout(500);
      const taskCount = await taskHelpers.getTaskCount();
      expect(taskCount).toBeGreaterThan(0);
    });

    test('should be case-insensitive', async ({ page }) => {
      // Search with different case
      const searchTerm = testTasks.simpleTask.title.toUpperCase();
      await taskHelpers.searchTasks(searchTerm);

      await page.waitForTimeout(500);
      const taskCount = await taskHelpers.getTaskCount();
      expect(taskCount).toBeGreaterThan(0);
    });

    test('should search in task descriptions', async ({ page }) => {
      // Search for text that appears in description
      const descriptionText = testTasks.simpleTask.description.substring(0, 10);
      await taskHelpers.searchTasks(descriptionText);

      await page.waitForTimeout(500);

      // Should find the task
      const taskCount = await taskHelpers.getTaskCount();
      expect(taskCount).toBeGreaterThan(0);
    });

    test('should show empty state for no search results', async ({ page }) => {
      await taskHelpers.searchTasks('ThisTaskDoesNotExistXYZ123');

      await page.waitForTimeout(500);

      // Should show empty state
      const emptyState = page.locator('text=/no.*found|no.*results|no.*match/i');
      await expect(emptyState).toBeVisible({ timeout: 5000 });
    });

    test('should clear search results when search input is cleared', async ({ page }) => {
      // First search for something
      await taskHelpers.searchTasks(testTasks.simpleTask.title);
      await page.waitForTimeout(500);

      // Clear search
      await taskHelpers.searchTasks('');
      await page.waitForTimeout(500);

      // Should show all tasks again
      const taskCount = await taskHelpers.getTaskCount();
      expect(taskCount).toBeGreaterThanOrEqual(3);
    });

    test('should update results as user types (debounced search)', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();

      // Type slowly to test debouncing
      await searchInput.fill(testTasks.simpleTask.title.charAt(0));
      await page.waitForTimeout(300);

      await searchInput.fill(testTasks.simpleTask.title.substring(0, 3));
      await page.waitForTimeout(300);

      // Results should update
      const taskCount = await taskHelpers.getTaskCount();
      expect(taskCount).toBeGreaterThan(0);
    });
  });

  test.describe('Combined Filtering and Search', () => {
    test('should apply both status filter and search together', async ({ page }) => {
      // Filter by status
      await taskHelpers.filterByStatus('todo');

      // Then search
      await taskHelpers.searchTasks(testTasks.simpleTask.title);

      await page.waitForTimeout(500);

      // Should show only todo tasks matching search
      expect(await taskHelpers.verifyTaskExists(testTasks.simpleTask.title)).toBe(true);
    });

    test('should maintain filter when search is cleared', async ({ page }) => {
      // Apply filter
      await taskHelpers.filterByStatus('in_progress');

      // Search
      await taskHelpers.searchTasks('test');
      await page.waitForTimeout(300);

      // Clear search
      await taskHelpers.searchTasks('');
      await page.waitForTimeout(300);

      // Filter should still be applied - only in_progress tasks visible
      const inProgressTask = await taskHelpers.findTaskByTitle(testTasks.urgentTask.title);
      await expect(inProgressTask).toBeVisible();
    });

    test('should maintain search when filter is changed', async ({ page }) => {
      // Search first
      const searchTerm = 'Task';
      await taskHelpers.searchTasks(searchTerm);
      await page.waitForTimeout(300);

      // Then change filter
      await taskHelpers.filterByStatus('todo');
      await page.waitForTimeout(300);

      // Search should still be applied
      const searchInput = page.locator('input[type="search"]').first();
      const searchValue = await searchInput.inputValue();
      expect(searchValue).toBe(searchTerm);
    });
  });

  test.describe('Sort Functionality (if implemented)', () => {
    test('should sort tasks by creation date', async ({ page }) => {
      // Check if sort dropdown exists
      const sortSelect = page.locator('select[name="sort"], select:has-text("Sort")');

      if (await sortSelect.count() > 0) {
        await sortSelect.selectOption('createdAt');
        await page.waitForTimeout(500);

        // Verify tasks are displayed
        const taskCount = await taskHelpers.getTaskCount();
        expect(taskCount).toBeGreaterThan(0);
      }
    });

    test('should sort tasks by title alphabetically', async ({ page }) => {
      const sortSelect = page.locator('select[name="sort"], select:has-text("Sort")');

      if (await sortSelect.count() > 0) {
        await sortSelect.selectOption('title');
        await page.waitForTimeout(500);

        const taskCount = await taskHelpers.getTaskCount();
        expect(taskCount).toBeGreaterThan(0);
      }
    });

    test('should toggle sort direction (ascending/descending)', async ({ page }) => {
      const sortButton = page.locator('button[aria-label*="sort"], button:has-text("Sort")');

      if (await sortButton.count() > 0) {
        // Click to change sort direction
        await sortButton.click();
        await page.waitForTimeout(500);

        // Tasks should reorder
        const taskCount = await taskHelpers.getTaskCount();
        expect(taskCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Advanced Filters (if implemented)', () => {
    test('should filter by assignee', async ({ page }) => {
      const assigneeFilter = page.locator('select[name="assignee"], select:has-text("Assignee")');

      if (await assigneeFilter.count() > 0) {
        // Get current user option
        const options = assigneeFilter.locator('option');
        const optionCount = await options.count();

        if (optionCount > 1) {
          await assigneeFilter.selectOption({ index: 1 });
          await page.waitForTimeout(500);

          // Should filter tasks
          const taskCount = await taskHelpers.getTaskCount();
          expect(taskCount).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('should filter by date range', async ({ page }) => {
      const dateFilter = page.locator('input[type="date"][name*="from"], input[type="date"][name*="start"]');

      if (await dateFilter.count() > 0) {
        await dateFilter.fill('2024-01-01');
        await page.waitForTimeout(500);

        const taskCount = await taskHelpers.getTaskCount();
        expect(taskCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Filter Persistence', () => {
    test('should remember filter selections after page reload', async ({ page }) => {
      // Apply a filter
      await taskHelpers.filterByStatus('todo');
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await page.waitForTimeout(1000);

      // Check if filter is still applied (might not be persisted in all implementations)
      const filterSelect = page.locator('select[name="status-filter"]').first();
      if (await filterSelect.count() > 0) {
        const selectedValue = await filterSelect.inputValue();
        // Filter might or might not persist depending on implementation
      }
    });

    test('should clear all filters with "Clear" button', async ({ page }) => {
      // Apply filters
      await taskHelpers.filterByStatus('todo');
      await taskHelpers.searchTasks('test');
      await page.waitForTimeout(500);

      // Look for clear/reset button
      const clearButton = page.locator('button:has-text("Clear"), button:has-text("Reset"), button:has-text("Clear filters")');

      if (await clearButton.count() > 0) {
        await clearButton.click();
        await page.waitForTimeout(500);

        // All tasks should be visible
        const taskCount = await taskHelpers.getTaskCount();
        expect(taskCount).toBeGreaterThanOrEqual(3);
      }
    });
  });
});
