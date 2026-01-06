import { Page, expect } from '@playwright/test';
import { TestUser } from '../fixtures/test-users';

/**
 * Authentication helper utilities for E2E tests
 */

export class AuthHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to login page
   */
  async goToLogin() {
    await this.page.goto('/login');
    await expect(this.page).toHaveURL(/.*login/);
  }

  /**
   * Navigate to signup page
   */
  async goToSignup() {
    await this.page.goto('/signup');
    await expect(this.page).toHaveURL(/.*signup/);
  }

  /**
   * Perform login with given credentials
   */
  async login(user: TestUser) {
    await this.goToLogin();
    await this.page.fill('input[name="email"], input[type="email"]', user.email);
    await this.page.fill('input[name="password"], input[type="password"]', user.password);
    await this.page.click('button[type="submit"]');

    // Wait for navigation to complete
    await this.page.waitForURL(/^((?!login).)*$/, { timeout: 10000 });
  }

  /**
   * Perform signup with given user data
   */
  async signup(user: TestUser) {
    await this.goToSignup();
    await this.page.fill('input[name="name"]', user.name);
    await this.page.fill('input[name="email"], input[type="email"]', user.email);
    await this.page.fill('input[name="password"], input[type="password"]', user.password);
    await this.page.click('button[type="submit"]');

    // Wait for navigation to complete
    await this.page.waitForURL(/^((?!signup).)*$/, { timeout: 10000 });
  }

  /**
   * Perform logout
   */
  async logout() {
    // Look for logout button in various common locations
    const logoutButton = this.page.locator('button:has-text("Logout"), button:has-text("Log out"), a:has-text("Logout"), a:has-text("Log out")').first();
    await logoutButton.click();

    // Wait for redirect to login
    await this.page.waitForURL(/.*login/, { timeout: 10000 });
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check for common authenticated elements
      const userMenu = this.page.locator('[data-testid="user-menu"], [aria-label="User menu"]');
      await userMenu.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get authentication token from storage
   */
  async getAuthToken(): Promise<string | null> {
    const token = await this.page.evaluate(() => {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    });
    return token;
  }

  /**
   * Set authentication token in storage
   */
  async setAuthToken(token: string) {
    await this.page.evaluate((t) => {
      localStorage.setItem('authToken', t);
    }, token);
  }

  /**
   * Clear all authentication data
   */
  async clearAuth() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}
