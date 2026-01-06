# TaskFlow SaaS - E2E Test Plan

## Overview

This document outlines the comprehensive end-to-end testing strategy for the TaskFlow SaaS application using Playwright.

**Last Updated:** 2026-01-06
**Test Framework:** Playwright
**Supported Browsers:** Chromium, Firefox, WebKit (Safari)
**Test Environment:** http://localhost:5173 (Frontend) + http://localhost:3000 (Backend API)

---

## Test Objectives

1. **Functional Correctness**: Verify all features work as specified
2. **Cross-Browser Compatibility**: Ensure consistent behavior across browsers
3. **Responsive Design**: Validate mobile, tablet, and desktop layouts
4. **Accessibility Compliance**: Meet WCAG 2.1 AA standards
5. **Error Handling**: Verify graceful degradation and error recovery
6. **Performance**: Ensure acceptable load times and responsiveness
7. **Security**: Validate proper authentication and authorization

---

## Test Scope

### In Scope

- ✅ User authentication (registration, login, logout)
- ✅ Task CRUD operations (create, read, update, delete)
- ✅ Task filtering and search functionality
- ✅ Error scenarios and edge cases
- ✅ Responsive design across devices
- ✅ Accessibility (keyboard navigation, screen readers)
- ✅ Cross-browser compatibility
- ✅ Form validation
- ✅ Navigation and routing

### Out of Scope

- ❌ Unit tests (covered by @test-architect)
- ❌ Backend API tests (covered by backend testing)
- ❌ Performance/load testing (separate suite)
- ❌ Security penetration testing (separate audit)

---

## Test Environment

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for running PostgreSQL)
- Git

### Setup

```bash
cd e2e-tests
npm install
npx playwright install
```

### Configuration

Test configuration is defined in `playwright.config.ts`:

- **Base URL**: http://localhost:5173
- **Parallel Execution**: Yes (except in CI)
- **Retries**: 2 on CI, 0 locally
- **Reporters**: HTML, JSON, JUnit, List
- **Timeouts**: 30s default

---

## Test Categories

### 1. Authentication Tests (`auth.spec.ts`)

**Coverage:**
- User registration with valid/invalid data
- User login with valid/invalid credentials
- Logout functionality
- Session persistence
- Protected route access
- Password reset (if implemented)
- Token expiration handling

**Test Users:**
- admin@taskflow.test (Admin)
- user1@taskflow.test (Regular User)
- user2@taskflow.test (Regular User)

**Key Scenarios:**
- ✓ Successful registration redirects to dashboard
- ✓ Invalid email shows validation error
- ✓ Weak password is rejected
- ✓ Duplicate email shows error
- ✓ Valid credentials allow login
- ✓ Invalid credentials show error
- ✓ Logout clears session
- ✓ Unauthenticated users redirected to login

---

### 2. Task CRUD Tests (`task-crud.spec.ts`)

**Coverage:**
- Creating tasks with various data
- Viewing task list and details
- Updating task properties
- Deleting tasks with confirmation
- Bulk operations (if implemented)

**Test Tasks:**
- Simple tasks
- Tasks with long content
- Tasks with special characters
- Tasks in all status states (todo, in_progress, done)

**Key Scenarios:**
- ✓ Create task and verify in list
- ✓ Edit task title/description/status
- ✓ Delete task removes from list
- ✓ Empty title shows validation error
- ✓ Modal closes on cancel
- ✓ Loading states displayed
- ✓ Optimistic UI updates

---

### 3. Filtering & Search Tests (`task-filtering-search.spec.ts`)

**Coverage:**
- Filter by status (todo, in_progress, done, all)
- Search by title and description
- Combined filtering and search
- Sorting (if implemented)
- Empty state handling

**Key Scenarios:**
- ✓ Filter shows only matching tasks
- ✓ Search is case-insensitive
- ✓ Search updates as user types
- ✓ Clear search shows all tasks
- ✓ Combined filter + search works
- ✓ Empty state for no results

---

### 4. Error Scenarios (`error-scenarios.spec.ts`)

**Coverage:**
- Network errors (offline, timeout, slow connection)
- API errors (500, 401, 403, 404, 429)
- Input validation edge cases
- XSS/SQL injection prevention
- Browser edge cases
- Data consistency issues
- Local storage issues

**Key Scenarios:**
- ✓ Offline mode shows error
- ✓ 500 error handled gracefully
- ✓ 401 redirects to login
- ✓ XSS attempts are sanitized
- ✓ Rate limiting shows error
- ✓ Multiple rapid clicks prevented
- ✓ Expired token handled

---

### 5. Accessibility Tests (`accessibility.spec.ts`)

**Coverage:**
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast
- Interactive element sizing
- Form validation accessibility
- ARIA landmarks and roles

**Key Scenarios:**
- ✓ Tab navigation through forms
- ✓ Enter key submits forms
- ✓ Escape closes modals
- ✓ Focus trapped in modals
- ✓ Proper heading hierarchy
- ✓ Form labels associated
- ✓ Alt text on images
- ✓ Visible focus indicators
- ✓ Minimum touch target size
- ✓ Error messages accessible

---

### 6. Responsive Design Tests (`responsive.spec.ts`)

**Coverage:**
- Mobile viewports (iPhone, small phones)
- Tablet viewports (iPad)
- Desktop viewports (standard, large)
- Breakpoint testing
- Touch interactions
- Responsive typography
- No horizontal overflow

**Viewports Tested:**
- 320x568 (iPhone SE)
- 375x667 (iPhone 12)
- 768x1024 (iPad)
- 1280x800 (Desktop)
- 1920x1080 (Large Desktop)

**Key Scenarios:**
- ✓ Mobile layout renders correctly
- ✓ Touch targets meet size requirements
- ✓ No horizontal scroll on any viewport
- ✓ Navigation accessible on mobile
- ✓ Modals work on small screens
- ✓ Text remains readable at all sizes

---

## Test Execution

### Running Tests

```bash
# Run all tests
npm test

# Run in headed mode (see browser)
npm run test:headed

# Run in UI mode (interactive)
npm run test:ui

# Run specific test file
npx playwright test auth.spec.ts

# Run specific browser
npm run test:chrome
npm run test:firefox
npm run test:safari

# Run all browsers
npm run test:all-browsers

# Debug mode
npm run test:debug

# Generate code
npm run codegen
```

### Viewing Reports

```bash
# Show HTML report
npm run report

# Reports are generated in:
# - playwright-report/ (HTML)
# - test-results/ (JSON, JUnit)
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          npm ci
          npx playwright install --with-deps
      - name: Run E2E tests
        run: npm test
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Data Management

### Fixtures

- **Test Users**: Defined in `fixtures/test-users.ts`
- **Test Tasks**: Defined in `fixtures/test-tasks.ts`

### Data Cleanup

Tests should:
1. Create necessary test data in `beforeEach` hooks
2. Clean up in `afterEach` hooks (if needed)
3. Use isolated test users to avoid conflicts
4. Reset state between test runs

---

## Best Practices

### Test Organization

- ✓ Group related tests with `test.describe()`
- ✓ Use descriptive test names
- ✓ Keep tests independent and isolated
- ✓ Follow AAA pattern (Arrange, Act, Assert)

### Selectors

- ✓ Prefer `data-testid` attributes
- ✓ Use semantic roles (`role="button"`)
- ✓ Avoid CSS class selectors (brittle)
- ✓ Use text content for buttons/links

### Assertions

- ✓ Use Playwright's `expect()` for auto-waiting
- ✓ Add timeout parameters for slower operations
- ✓ Assert on visible elements, not just DOM existence

### Debugging

- ✓ Use `page.pause()` to inspect state
- ✓ Enable headed mode with `--headed`
- ✓ Check screenshots on failure
- ✓ Review trace files with `npx playwright show-trace`

---

## Coverage Goals

| Category | Target | Status |
|----------|--------|--------|
| Authentication | 100% | ✅ |
| Task CRUD | 100% | ✅ |
| Filtering/Search | 90% | ✅ |
| Error Handling | 80% | ✅ |
| Accessibility | 90% | ✅ |
| Responsive | 85% | ✅ |
| Cross-browser | All 3 | ✅ |

---

## Known Issues & Limitations

1. **API Mocking**: Some tests rely on actual backend API
2. **Test Data**: Tests create real data in test database
3. **Flakiness**: Network-dependent tests may be flaky
4. **Performance**: Large test suites can be slow

---

## Manual Testing Checklist

Some scenarios require manual verification:

### Visual QA
- [ ] UI matches design mockups
- [ ] Colors and typography consistent
- [ ] Animations smooth and purposeful
- [ ] No visual glitches or overlaps

### Usability
- [ ] User flow feels intuitive
- [ ] Error messages are helpful
- [ ] Loading states provide feedback
- [ ] Success confirmations visible

### Browser-Specific
- [ ] Test on real iOS Safari
- [ ] Test on real Android Chrome
- [ ] Verify on older browser versions
- [ ] Check with browser extensions enabled

### Performance
- [ ] Initial load under 3 seconds
- [ ] Task list renders quickly
- [ ] Search is responsive
- [ ] No memory leaks over time

### Security
- [ ] Verify HTTPS in production
- [ ] Check for exposed secrets
- [ ] Test XSS protection manually
- [ ] Verify CSP headers

---

## Test Maintenance

### When to Update Tests

- ✅ Feature changes or additions
- ✅ UI/UX redesigns
- ✅ API contract changes
- ✅ Bug fixes (add regression tests)
- ✅ New edge cases discovered

### Review Process

1. Code review required for test changes
2. Tests must pass before merging
3. Flaky tests should be fixed or removed
4. Coverage should not decrease

---

## Resources

### Documentation
- [Playwright Docs](https://playwright.dev)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)

### Tools
- [Playwright Test Runner](https://playwright.dev/docs/intro)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Codegen](https://playwright.dev/docs/codegen)

---

## Contact

For questions about E2E tests, contact:
- **QA Lead**: @frontend-qa-enforcer
- **Repository**: [Link to repo]
- **Issue Tracker**: [Link to issues]

---

## Appendix

### Test File Structure

```
e2e-tests/
├── playwright.config.ts      # Playwright configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript config
├── tests/                     # Test files
│   ├── auth.spec.ts
│   ├── task-crud.spec.ts
│   ├── task-filtering-search.spec.ts
│   ├── error-scenarios.spec.ts
│   ├── accessibility.spec.ts
│   └── responsive.spec.ts
├── fixtures/                  # Test data
│   ├── test-users.ts
│   └── test-tasks.ts
├── utils/                     # Helper utilities
│   ├── auth-helpers.ts
│   ├── task-helpers.ts
│   └── api-helpers.ts
└── TEST_PLAN.md              # This document
```

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-06 | Initial test plan |

---

**End of Test Plan**
