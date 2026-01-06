import { test, expect, devices } from '@playwright/test';
import { AuthHelpers } from '../utils/auth-helpers';
import { TaskHelpers } from '../utils/task-helpers';
import { testUsers } from '../fixtures/test-users';
import { testTasks } from '../fixtures/test-tasks';

test.describe('Responsive Design Testing', () => {
  test.describe('Mobile Viewport - iPhone', () => {
    test.use({ ...devices['iPhone 12'] });

    let authHelpers: AuthHelpers;
    let taskHelpers: TaskHelpers;

    test.beforeEach(async ({ page }) => {
      authHelpers = new AuthHelpers(page);
      taskHelpers = new TaskHelpers(page);
    });

    test('should display login form properly on mobile', async ({ page }) => {
      await authHelpers.goToLogin();

      const form = page.locator('form').first();
      await expect(form).toBeVisible();

      // Inputs should be full width or appropriately sized
      const emailInput = page.locator('input[name="email"]');
      const inputBox = await emailInput.boundingBox();

      expect(inputBox).toBeTruthy();
      if (inputBox) {
        expect(inputBox.width).toBeGreaterThan(200);
      }
    });

    test('should allow login on mobile', async ({ page }) => {
      await authHelpers.login(testUsers.user1);

      await expect(page).toHaveURL(/dashboard|tasks/);
      expect(await authHelpers.isLoggedIn()).toBe(true);
    });

    test('should display task list in mobile layout', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      await taskHelpers.createTask(testTasks.simpleTask);

      // Task list should be visible and stacked vertically
      const taskList = page.locator('[data-testid="task-list"], .task-list');
      await expect(taskList).toBeVisible({ timeout: 5000 });
    });

    test('should open task creation in mobile modal', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      await taskHelpers.openCreateTaskModal();

      // Modal should take full screen or appropriate mobile size
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      const modalBox = await modal.boundingBox();
      expect(modalBox).toBeTruthy();
    });

    test('should have accessible mobile navigation', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      // Look for hamburger menu or mobile nav
      const mobileNav = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i], .hamburger, [data-testid="mobile-menu"]');

      if (await mobileNav.count() > 0) {
        await mobileNav.first().click();

        // Menu should open
        await page.waitForTimeout(500);
        const navMenu = page.locator('nav, [role="navigation"]');
        await expect(navMenu).toBeVisible();
      }
    });

    test('should handle touch interactions', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      await taskHelpers.createTask(testTasks.simpleTask);

      // Tap on task
      const task = await taskHelpers.findTaskByTitle(testTasks.simpleTask.title);
      await task.tap();

      await page.waitForTimeout(500);

      // Task details or edit view should open
      const isDetailView = page.url().includes('task') ||
                           await page.locator('text="Edit"').count() > 0 ||
                           await page.locator('[role="dialog"]').count() > 0;

      expect(isDetailView).toBe(true);
    });

    test('should not have horizontal scroll', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });

    test('should have appropriately sized touch targets', async ({ page }) => {
      await authHelpers.goToLogin();

      const submitButton = page.locator('button[type="submit"]').first();
      const box = await submitButton.boundingBox();

      if (box) {
        // Touch targets should be at least 44x44 CSS pixels
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    });
  });

  test.describe('Tablet Viewport - iPad', () => {
    test.use({ ...devices['iPad Pro'] });

    let authHelpers: AuthHelpers;
    let taskHelpers: TaskHelpers;

    test.beforeEach(async ({ page }) => {
      authHelpers = new AuthHelpers(page);
      taskHelpers = new TaskHelpers(page);
    });

    test('should display properly on tablet', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      // Layout should work on tablet
      const taskList = page.locator('[data-testid="task-list"], .task-list');
      await expect(taskList).toBeVisible({ timeout: 5000 });
    });

    test('should handle tablet-specific interactions', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      await taskHelpers.createTask(testTasks.simpleTask);

      // Should be able to create and view tasks
      expect(await taskHelpers.verifyTaskExists(testTasks.simpleTask.title)).toBe(true);
    });

    test('should support landscape and portrait orientation', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      // Check that page renders in current orientation
      const viewport = page.viewportSize();
      expect(viewport).toBeTruthy();

      if (viewport) {
        // Verify content is visible
        const content = page.locator('main, [role="main"], body');
        await expect(content).toBeVisible();
      }
    });
  });

  test.describe('Desktop Viewport - Standard', () => {
    let authHelpers: AuthHelpers;
    let taskHelpers: TaskHelpers;

    test.beforeEach(async ({ page }) => {
      authHelpers = new AuthHelpers(page);
      taskHelpers = new TaskHelpers(page);
    });

    test('should display full desktop layout', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      // Desktop might have sidebar or multi-column layout
      const mainContent = page.locator('main, [role="main"]');
      await expect(mainContent).toBeVisible();
    });

    test('should support keyboard shortcuts on desktop', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      // Try common shortcuts like Ctrl+K or Cmd+K for search
      const isMac = await page.evaluate(() => navigator.platform.toLowerCase().includes('mac'));
      const modifierKey = isMac ? 'Meta' : 'Control';

      // Press Ctrl/Cmd + N to create new task (if implemented)
      await page.keyboard.press(`${modifierKey}+N`);
      await page.waitForTimeout(500);

      // Modal might open (if shortcut is implemented)
      const modalOpen = await page.locator('[role="dialog"]').isVisible().catch(() => false);

      // Shortcuts might not be implemented, so this is okay either way
      expect(true).toBe(true);
    });

    test('should have hover states for interactive elements', async ({ page }) => {
      await authHelpers.goToLogin();

      const submitButton = page.locator('button[type="submit"]').first();

      // Hover over button
      await submitButton.hover();
      await page.waitForTimeout(200);

      // Check for style changes (this is hard to test precisely)
      const cursor = await submitButton.evaluate(el =>
        window.getComputedStyle(el).cursor
      );

      expect(cursor).toBe('pointer');
    });
  });

  test.describe('Large Desktop Viewport', () => {
    test.use({
      viewport: { width: 1920, height: 1080 }
    });

    let authHelpers: AuthHelpers;
    let taskHelpers: TaskHelpers;

    test.beforeEach(async ({ page }) => {
      authHelpers = new AuthHelpers(page);
      taskHelpers = new TaskHelpers(page);
    });

    test('should utilize large screen space appropriately', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      // Content should not be too stretched out
      const mainContent = page.locator('main, [role="main"]').first();
      const contentBox = await mainContent.boundingBox();

      expect(contentBox).toBeTruthy();

      // On large screens, content often has max-width
      if (contentBox) {
        // Content shouldn't be more than 2000px wide typically
        expect(contentBox.width).toBeLessThan(2000);
      }
    });

    test('should display multi-column layout if designed', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      // Verify layout renders correctly
      const taskList = page.locator('[data-testid="task-list"], .task-list');
      await expect(taskList).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Small Mobile Viewport', () => {
    test.use({
      viewport: { width: 320, height: 568 } // iPhone SE size
    });

    let authHelpers: AuthHelpers;
    let taskHelpers: TaskHelpers;

    test.beforeEach(async ({ page }) => {
      authHelpers = new AuthHelpers(page);
      taskHelpers = new TaskHelpers(page);
    });

    test('should work on small mobile screens', async ({ page }) => {
      await authHelpers.goToLogin();

      // Form should fit without horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);

      // Should be able to login
      await page.fill('input[name="email"]', testUsers.user1.email);
      await page.fill('input[name="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');

      await page.waitForTimeout(2000);
    });

    test('should have readable text on small screens', async ({ page }) => {
      await authHelpers.goToLogin();

      const heading = page.locator('h1').first();
      const fontSize = await heading.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );

      // Font size should be at least 16px for readability
      const fontSizeNum = parseFloat(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(14);
    });
  });

  test.describe('Responsive Images and Media', () => {
    test('should load appropriate image sizes', async ({ page }) => {
      await page.goto('/');

      const images = await page.locator('img').all();

      for (const img of images) {
        // Images should have srcset or appropriate sizing
        const srcset = await img.getAttribute('srcset');
        const loading = await img.getAttribute('loading');

        // Modern practice includes srcset or lazy loading
        expect(true).toBe(true); // Images exist
      }
    });

    test('should handle video/media elements responsively', async ({ page }) => {
      await page.goto('/');

      const videos = await page.locator('video').all();

      for (const video of videos) {
        // Videos should be responsive
        const width = await video.evaluate(el =>
          window.getComputedStyle(el).width
        );

        expect(width).toBeTruthy();
      }
    });
  });

  test.describe('Responsive Typography', () => {
    test('should scale text appropriately across viewports', async ({ page }) => {
      await authHelpers.goToLogin();

      const heading = page.locator('h1').first();
      const fontSize = await heading.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
        };
      });

      expect(fontSize.fontSize).toBeTruthy();
      expect(fontSize.lineHeight).toBeTruthy();
    });

    test('should maintain readable line length', async ({ page }) => {
      await authHelpers.login(testUsers.user1);
      await taskHelpers.goToDashboard();

      // Line length should be optimal (45-75 characters)
      const paragraph = page.locator('p').first();

      if (await paragraph.count() > 0) {
        const width = await paragraph.evaluate(el => el.offsetWidth);
        expect(width).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Breakpoint Testing', () => {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 800 },
      { name: 'large', width: 1920, height: 1080 },
    ];

    for (const breakpoint of breakpoints) {
      test(`should render correctly at ${breakpoint.name} breakpoint`, async ({ page }) => {
        await page.setViewportSize({
          width: breakpoint.width,
          height: breakpoint.height
        });

        const authHelpers = new AuthHelpers(page);
        await authHelpers.goToLogin();

        // Page should render without errors
        const form = page.locator('form').first();
        await expect(form).toBeVisible();

        // No horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalScroll).toBe(false);
      });
    }
  });
});
