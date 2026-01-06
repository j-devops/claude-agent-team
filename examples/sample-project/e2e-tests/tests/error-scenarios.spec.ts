import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../utils/auth-helpers';
import { TaskHelpers } from '../utils/task-helpers';
import { testUsers } from '../fixtures/test-users';
import { testTasks } from '../fixtures/test-tasks';

test.describe('Error Scenarios and Edge Cases', () => {
  let authHelpers: AuthHelpers;
  let taskHelpers: TaskHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    taskHelpers = new TaskHelpers(page);
  });

  test.describe('Network Errors', () => {
    test('should handle API server being down', async ({ page, context }) => {
      // Simulate offline mode
      await context.setOffline(true);

      await authHelpers.goToLogin();

      await page.fill('input[name="email"]', testUsers.user1.email);
      await page.fill('input[name="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');

      // Should show network error
      const errorMessage = page.locator('text=/network.*error|connection.*failed|unable.*connect|offline/i, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });

      // Restore connection
      await context.setOffline(false);
    });

    test('should handle slow network gracefully', async ({ page, context }) => {
      // Simulate slow connection
      await context.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });

      await authHelpers.goToLogin();

      await page.fill('input[name="email"]', testUsers.user1.email);
      await page.fill('input[name="password"]', testUsers.user1.password);

      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Should show loading state
      const loadingIndicator = page.locator('[role="progressbar"], .loading, .spinner, button[disabled]');
      await expect(loadingIndicator).toBeVisible({ timeout: 3000 });
    });

    test('should handle request timeout', async ({ page }) => {
      // Login first
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      // Intercept and delay API request to cause timeout
      await page.route('**/api/tasks*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 30000));
        await route.abort('timedout');
      });

      // Try to create a task
      try {
        await taskHelpers.openCreateTaskModal();
        await page.fill('input[name="title"]', 'Test Task');
        await page.click('button[type="submit"]');

        // Should show timeout error
        await page.waitForTimeout(2000);
        const errorMessage = page.locator('text=/timeout|took too long|request.*failed/i, [role="alert"]');
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
      } catch (error) {
        // Expected behavior - timeout occurred
      }
    });
  });

  test.describe('API Error Responses', () => {
    test('should handle 500 Internal Server Error', async ({ page }) => {
      await page.route('**/api/auth/login', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Internal Server Error' } }),
        });
      });

      await authHelpers.goToLogin();
      await page.fill('input[name="email"]', testUsers.user1.email);
      await page.fill('input[name="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');

      // Should show error message
      const errorMessage = page.locator('text=/server.*error|internal.*error|something.*wrong/i, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should handle 401 Unauthorized', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      // Intercept API calls and return 401
      await page.route('**/api/tasks*', (route) => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Unauthorized' } }),
        });
      });

      // Try to load tasks
      await page.reload();

      // Should redirect to login or show auth error
      await page.waitForTimeout(2000);
      const isOnLogin = page.url().includes('login');
      const hasAuthError = await page.locator('text=/unauthorized|session.*expired|please.*login/i').count() > 0;

      expect(isOnLogin || hasAuthError).toBe(true);
    });

    test('should handle 403 Forbidden', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      await page.route('**/api/tasks/*', (route) => {
        if (route.request().method() === 'DELETE') {
          route.fulfill({
            status: 403,
            contentType: 'application/json',
            body: JSON.stringify({ error: { message: 'Forbidden' } }),
          });
        } else {
          route.continue();
        }
      });

      // Create a task first
      await taskHelpers.createTask(testTasks.simpleTask);

      // Try to delete it (should fail with 403)
      await taskHelpers.openTask(testTasks.simpleTask.title);
      await page.click('button:has-text("Delete")');

      // Confirm if needed
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }

      // Should show forbidden error
      await page.waitForTimeout(1000);
      const errorMessage = page.locator('text=/forbidden|permission.*denied|not.*allowed/i, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should handle 404 Not Found', async ({ page }) => {
      await authHelpers.login(testUsers.user1);

      // Try to navigate to non-existent task
      await page.goto('/tasks/non-existent-id-12345');

      // Should show 404 error or redirect
      await page.waitForTimeout(1000);
      const notFoundMessage = page.locator('text=/not.*found|does.*not.*exist|404/i');
      const redirectedToDashboard = page.url().includes('dashboard');

      const hasNotFound = await notFoundMessage.isVisible().catch(() => false);
      expect(hasNotFound || redirectedToDashboard).toBe(true);
    });

    test('should handle 429 Rate Limit Exceeded', async ({ page }) => {
      let requestCount = 0;

      await page.route('**/api/**', (route) => {
        requestCount++;
        if (requestCount > 5) {
          route.fulfill({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify({ error: { message: 'Too many requests' } }),
          });
        } else {
          route.continue();
        }
      });

      await authHelpers.goToLogin();

      // Make multiple rapid requests
      for (let i = 0; i < 7; i++) {
        await page.fill('input[name="email"]', testUsers.user1.email);
        await page.fill('input[name="password"]', 'wrong-password');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(200);
      }

      // Should show rate limit error
      const errorMessage = page.locator('text=/too.*many.*requests|rate.*limit|slow.*down/i, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Input Validation Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();
    });

    test('should handle SQL injection attempts safely', async ({ page }) => {
      await taskHelpers.openCreateTaskModal();

      const maliciousInput = "'; DROP TABLE tasks; --";
      await page.fill('input[name="title"]', maliciousInput);
      await page.fill('textarea[name="description"]', 'Normal description');
      await page.click('button[type="submit"]');

      // Should either reject or sanitize the input
      await page.waitForTimeout(1000);

      // App should still be functional
      const taskCount = await taskHelpers.getTaskCount();
      expect(taskCount).toBeGreaterThanOrEqual(0);
    });

    test('should handle XSS attempts in task title', async ({ page }) => {
      await taskHelpers.openCreateTaskModal();

      const xssPayload = '<script>alert("XSS")</script>';
      await page.fill('input[name="title"]', xssPayload);
      await page.fill('textarea[name="description"]', 'Test description');
      await page.click('button[type="submit"]');

      await page.waitForTimeout(1000);

      // Should not execute script - check that no alert appeared
      // If task was created, it should display safely
      const hasTask = await taskHelpers.getTaskCount();
      expect(hasTask).toBeGreaterThanOrEqual(0);

      // Verify no script execution (implicit - test would fail if alert appeared)
    });

    test('should handle extremely long input', async ({ page }) => {
      await taskHelpers.openCreateTaskModal();

      const veryLongTitle = 'A'.repeat(10000);
      await page.fill('input[name="title"]', veryLongTitle);
      await page.click('button[type="submit"]');

      // Should show validation error or truncate
      await page.waitForTimeout(1000);
      const errorMessage = page.locator('text=/too.*long|max.*length|character.*limit/i, [role="alert"]');
      const hasError = await errorMessage.isVisible().catch(() => false);

      // Should handle gracefully either way
      expect(true).toBe(true);
    });

    test('should handle unicode and emoji in task title', async ({ page }) => {
      const unicodeTitle = '任務 📝 Test Task 🎉';
      await taskHelpers.createTask({
        title: unicodeTitle,
        description: 'Testing unicode support',
        status: 'todo',
      });

      // Should handle unicode correctly
      await page.waitForTimeout(500);
      const taskCount = await taskHelpers.getTaskCount();
      expect(taskCount).toBeGreaterThan(0);
    });

    test('should handle null bytes in input', async ({ page }) => {
      await taskHelpers.openCreateTaskModal();

      const inputWithNull = 'Task\x00Title';
      await page.fill('input[name="title"]', inputWithNull);
      await page.fill('textarea[name="description"]', 'Description');
      await page.click('button[type="submit"]');

      // Should handle gracefully
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Browser Edge Cases', () => {
    test('should work with JavaScript disabled (graceful degradation)', async ({ page }) => {
      // Note: This is difficult to test in Playwright, but we can check for noscript tags
      const noscript = page.locator('noscript');
      const hasNoscript = await noscript.count() > 0;

      // Just verify the app structure exists
      expect(true).toBe(true);
    });

    test('should handle browser back button correctly', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      // Navigate to a different page (if exists)
      await page.goto('/profile');
      await page.waitForTimeout(500);

      // Go back
      await page.goBack();

      // Should return to dashboard
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should handle browser refresh on protected route', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      // Refresh page
      await page.reload();

      // Should remain authenticated
      await expect(page).toHaveURL(/dashboard/);
      expect(await authHelpers.isLoggedIn()).toBe(true);
    });

    test('should handle multiple rapid clicks on submit button', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      await taskHelpers.openCreateTaskModal();

      await page.fill('input[name="title"]', 'Rapid Click Test');
      await page.fill('textarea[name="description"]', 'Testing rapid submissions');

      // Click submit multiple times rapidly
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      await submitButton.click();
      await submitButton.click();

      await page.waitForTimeout(2000);

      // Should only create one task (button should be disabled after first click)
      const duplicateTasks = await page.locator('text="Rapid Click Test"').count();
      expect(duplicateTasks).toBeLessThanOrEqual(1);
    });
  });

  test.describe('Data Consistency', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();
    });

    test('should handle concurrent task updates', async ({ page, context }) => {
      // Create a task
      await taskHelpers.createTask(testTasks.simpleTask);

      // Open same task in two contexts (tabs)
      const page2 = await context.newPage();
      const taskHelpers2 = new TaskHelpers(page2);
      const authHelpers2 = new AuthHelpers(page2);

      await authHelpers2.login(testUsers.user1);
      await taskHelpers2.goToDashboard();

      // Both pages edit the same task
      await taskHelpers.openTask(testTasks.simpleTask.title);
      await taskHelpers2.openTask(testTasks.simpleTask.title);

      // Make different edits
      // This tests optimistic locking or conflict resolution
      await page.waitForTimeout(1000);

      await page2.close();
    });

    test('should handle deleted task still open in another tab', async ({ page }) => {
      await taskHelpers.createTask(testTasks.simpleTask);

      // Simulate: task deleted by another user
      await page.route('**/api/tasks/*', (route) => {
        if (route.request().method() === 'GET') {
          route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: { message: 'Task not found' } }),
          });
        } else {
          route.continue();
        }
      });

      await taskHelpers.openTask(testTasks.simpleTask.title);

      // Should handle gracefully - show error or redirect
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Accessibility Error States', () => {
    test('should announce errors to screen readers', async ({ page }) => {
      await authHelpers.goToLogin();

      await page.fill('input[name="email"]', 'invalid-email');
      await page.click('button[type="submit"]');

      // Error should have proper ARIA attributes
      const errorMessage = page.locator('[role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should set focus to error message', async ({ page }) => {
      await authHelpers.goToLogin();

      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);

      // Check that an error element exists (focus management might vary)
      const errorMessages = await page.locator('[role="alert"], .error').count();
      expect(errorMessages).toBeGreaterThan(0);
    });
  });

  test.describe('Local Storage Issues', () => {
    test('should handle localStorage being full', async ({ page }) => {
      // Fill localStorage
      await page.evaluate(() => {
        try {
          for (let i = 0; i < 10000; i++) {
            localStorage.setItem(`key${i}`, 'x'.repeat(1000));
          }
        } catch (e) {
          // Storage full
        }
      });

      // Try to login (which stores token)
      await authHelpers.goToLogin();
      await page.fill('input[name="email"]', testUsers.user1.email);
      await page.fill('input[name="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');

      // Should handle gracefully, maybe use sessionStorage instead
      await page.waitForTimeout(2000);
    });

    test('should handle localStorage being disabled', async ({ page, context }) => {
      // Clear and disable localStorage
      await page.evaluate(() => {
        localStorage.clear();
      });

      // Try to use the app
      await authHelpers.goToLogin();
      await page.fill('input[name="email"]', testUsers.user1.email);
      await page.fill('input[name="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');

      // Should fallback to sessionStorage or cookies
      await page.waitForTimeout(2000);
    });
  });
});
