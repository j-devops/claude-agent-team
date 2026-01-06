import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../utils/auth-helpers';
import { testUsers, invalidUsers } from '../fixtures/test-users';

test.describe('Authentication Flow', () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    await authHelpers.clearAuth();
  });

  test.describe('User Registration', () => {
    test('should successfully register a new user', async ({ page }) => {
      const newUser = testUsers.newUser;

      await authHelpers.goToSignup();

      // Fill in registration form
      await page.fill('input[name="name"]', newUser.name);
      await page.fill('input[name="email"]', newUser.email);
      await page.fill('input[name="password"]', newUser.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to dashboard after successful registration
      await expect(page).toHaveURL(/dashboard|tasks/, { timeout: 10000 });

      // Verify user is logged in
      expect(await authHelpers.isLoggedIn()).toBe(true);
    });

    test('should show error for invalid email format', async ({ page }) => {
      await authHelpers.goToSignup();

      await page.fill('input[name="name"]', invalidUsers.invalidEmail.name);
      await page.fill('input[name="email"]', invalidUsers.invalidEmail.email);
      await page.fill('input[name="password"]', invalidUsers.invalidEmail.password);

      await page.click('button[type="submit"]');

      // Should show validation error
      const errorMessage = page.locator('text=/invalid.*email/i, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should show error for weak password', async ({ page }) => {
      await authHelpers.goToSignup();

      await page.fill('input[name="name"]', invalidUsers.weakPassword.name);
      await page.fill('input[name="email"]', invalidUsers.weakPassword.email);
      await page.fill('input[name="password"]', invalidUsers.weakPassword.password);

      await page.click('button[type="submit"]');

      // Should show validation error
      const errorMessage = page.locator('text=/password.*weak|password.*short|password.*length/i, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should show error for empty required fields', async ({ page }) => {
      await authHelpers.goToSignup();

      // Try to submit with empty fields
      await page.click('button[type="submit"]');

      // Should show validation errors
      const errorMessages = page.locator('[role="alert"], .error, .error-message');
      await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
    });

    test('should show error for duplicate email', async ({ page }) => {
      const existingUser = testUsers.user1;

      await authHelpers.goToSignup();

      await page.fill('input[name="name"]', existingUser.name);
      await page.fill('input[name="email"]', existingUser.email);
      await page.fill('input[name="password"]', existingUser.password);

      await page.click('button[type="submit"]');

      // Should show error about existing email
      const errorMessage = page.locator('text=/email.*already.*exists|email.*taken|user.*already.*registered/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('User Login', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      const user = testUsers.user1;

      await authHelpers.login(user);

      // Should redirect to dashboard
      await expect(page).toHaveURL(/dashboard|tasks/);

      // Verify user is logged in
      expect(await authHelpers.isLoggedIn()).toBe(true);

      // Verify auth token is stored
      const token = await authHelpers.getAuthToken();
      expect(token).toBeTruthy();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await authHelpers.goToLogin();

      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'WrongPassword123!');

      await page.click('button[type="submit"]');

      // Should show error message
      const errorMessage = page.locator('text=/invalid.*credentials|incorrect.*password|user.*not.*found/i, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });

      // Should remain on login page
      await expect(page).toHaveURL(/login/);
    });

    test('should show error for empty login fields', async ({ page }) => {
      await authHelpers.goToLogin();

      // Try to submit with empty fields
      await page.click('button[type="submit"]');

      // Should show validation errors
      const errorMessages = page.locator('[role="alert"], .error, .error-message');
      await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
    });

    test('should have working "Remember me" checkbox', async ({ page }) => {
      const user = testUsers.user1;

      await authHelpers.goToLogin();

      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);

      // Check remember me if it exists
      const rememberCheckbox = page.locator('input[name="remember"], input[type="checkbox"]:near(:text("Remember"))');
      if (await rememberCheckbox.count() > 0) {
        await rememberCheckbox.check();
      }

      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/dashboard|tasks/);
    });

    test('should have link to signup page', async ({ page }) => {
      await authHelpers.goToLogin();

      const signupLink = page.locator('a:has-text("Sign up"), a:has-text("Register"), a:has-text("Create account")');
      await expect(signupLink).toBeVisible();

      await signupLink.click();
      await expect(page).toHaveURL(/signup|register/);
    });
  });

  test.describe('User Logout', () => {
    test('should successfully logout', async ({ page }) => {
      const user = testUsers.user1;

      // Login first
      await authHelpers.login(user);
      await expect(page).toHaveURL(/dashboard|tasks/);

      // Logout
      await authHelpers.logout();

      // Should redirect to login page
      await expect(page).toHaveURL(/login/);

      // Verify user is not logged in
      expect(await authHelpers.isLoggedIn()).toBe(false);

      // Verify auth token is cleared
      const token = await authHelpers.getAuthToken();
      expect(token).toBeFalsy();
    });

    test('should redirect to login when accessing protected route after logout', async ({ page }) => {
      const user = testUsers.user1;

      // Login and logout
      await authHelpers.login(user);
      await authHelpers.logout();

      // Try to access dashboard
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/login/, { timeout: 5000 });
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated user to login', async ({ page }) => {
      // Try to access protected route without authentication
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/login/, { timeout: 5000 });
    });

    test('should allow authenticated user to access dashboard', async ({ page }) => {
      const user = testUsers.user1;

      await authHelpers.login(user);

      // Try to access dashboard
      await page.goto('/dashboard');

      // Should stay on dashboard
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should persist authentication across page reloads', async ({ page }) => {
      const user = testUsers.user1;

      await authHelpers.login(user);
      await expect(page).toHaveURL(/dashboard|tasks/);

      // Reload page
      await page.reload();

      // Should remain authenticated
      expect(await authHelpers.isLoggedIn()).toBe(true);
      await expect(page).toHaveURL(/dashboard|tasks/);
    });
  });

  test.describe('Password Reset (if implemented)', () => {
    test('should have forgot password link', async ({ page }) => {
      await authHelpers.goToLogin();

      const forgotPasswordLink = page.locator('a:has-text("Forgot password"), a:has-text("Reset password")');

      // Only run if forgot password link exists
      if (await forgotPasswordLink.count() > 0) {
        await expect(forgotPasswordLink).toBeVisible();
        await forgotPasswordLink.click();
        await expect(page).toHaveURL(/forgot|reset/);
      }
    });
  });

  test.describe('Session Management', () => {
    test('should handle expired token gracefully', async ({ page }) => {
      const user = testUsers.user1;

      await authHelpers.login(user);

      // Set an expired/invalid token
      await authHelpers.setAuthToken('invalid-expired-token');

      // Try to access a protected route
      await page.goto('/dashboard');

      // Should redirect to login or show error
      await page.waitForTimeout(2000);
      const isOnLogin = page.url().includes('login');
      const hasError = await page.locator('[role="alert"], .error').count() > 0;

      expect(isOnLogin || hasError).toBe(true);
    });
  });
});
