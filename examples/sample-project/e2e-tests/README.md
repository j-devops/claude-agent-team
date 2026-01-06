# TaskFlow SaaS - E2E Tests

End-to-end testing suite for TaskFlow SaaS application using Playwright.

## Quick Start

### Installation

```bash
npm install
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm test

# Run in headed mode (see browser)
npm run test:headed

# Run in UI mode (interactive debugging)
npm run test:ui

# Run specific browser
npm run test:chrome
npm run test:firefox
npm run test:safari

# Run all browsers in parallel
npm run test:all-browsers

# Debug tests
npm run test:debug
```

### View Test Reports

```bash
npm run report
```

## Test Structure

```
e2e-tests/
├── tests/                     # Test files
│   ├── auth.spec.ts          # Authentication tests
│   ├── task-crud.spec.ts     # Task CRUD operations
│   ├── task-filtering-search.spec.ts  # Filtering & search
│   ├── error-scenarios.spec.ts        # Error handling
│   ├── accessibility.spec.ts          # A11y tests
│   └── responsive.spec.ts             # Responsive design
├── fixtures/                  # Test data
│   ├── test-users.ts         # User fixtures
│   └── test-tasks.ts         # Task fixtures
├── utils/                     # Helper utilities
│   ├── auth-helpers.ts       # Authentication helpers
│   ├── task-helpers.ts       # Task operation helpers
│   └── api-helpers.ts        # API utilities
└── TEST_PLAN.md              # Comprehensive test plan
```

## Prerequisites

Before running tests, ensure:

1. **Frontend** is running on `http://localhost:5173`
2. **Backend** is running on `http://localhost:3000`
3. **Database** is accessible and seeded with test users

## Test Coverage

- ✅ **Authentication**: Login, logout, registration, session management
- ✅ **Task Management**: CRUD operations, validation
- ✅ **Filtering & Search**: Status filters, text search, sorting
- ✅ **Error Handling**: Network errors, API errors, validation
- ✅ **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation
- ✅ **Responsive Design**: Mobile, tablet, desktop viewports
- ✅ **Cross-Browser**: Chrome, Firefox, Safari

## Configuration

Edit `playwright.config.ts` to customize:

- Base URL
- Browser list
- Parallel workers
- Retry strategy
- Screenshot/video settings
- Timeouts

## Writing New Tests

1. Create a new `.spec.ts` file in `tests/`
2. Import necessary helpers from `utils/`
3. Use fixtures from `fixtures/` for test data
4. Follow existing patterns for consistency

### Example

```typescript
import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../utils/auth-helpers';
import { testUsers } from '../fixtures/test-users';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    const authHelpers = new AuthHelpers(page);
    await authHelpers.login(testUsers.user1);

    // Your test code here
    await expect(page.locator('h1')).toHaveText('Dashboard');
  });
});
```

## Best Practices

1. **Use Helper Methods**: Leverage existing helpers in `utils/`
2. **Descriptive Names**: Test names should describe expected behavior
3. **Independent Tests**: Each test should be able to run in isolation
4. **Clean State**: Use `beforeEach` to set up clean state
5. **Avoid Hardcoded Waits**: Use Playwright's auto-waiting instead of `waitForTimeout`
6. **Proper Selectors**: Prefer `data-testid`, roles, or text over CSS classes

## Debugging Tips

### Visual Debugging

```bash
# Run with browser visible
npm run test:headed

# Interactive mode
npm run test:ui

# Pause execution
await page.pause();
```

### Trace Viewer

```bash
# Tests automatically record traces on first retry
# View traces:
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Screenshots & Videos

Screenshots and videos are captured on failure and saved to `test-results/`.

## CI/CD Integration

Tests run automatically in CI pipeline:

- **Trigger**: On push and pull request
- **Environment**: GitHub Actions
- **Reports**: Uploaded as artifacts
- **Failures**: Block merge

## Environment Variables

```bash
# Custom base URL
BASE_URL=http://localhost:5173

# CI mode (affects retries and parallelization)
CI=true
```

## Troubleshooting

### Tests Failing Locally

1. Check frontend and backend are running
2. Ensure database has test users
3. Clear browser cache: `npx playwright clean`
4. Update browsers: `npx playwright install`

### Flaky Tests

1. Check for race conditions
2. Add explicit waits where needed
3. Review test-results for screenshots
4. Use trace viewer to debug

### Slow Tests

1. Run specific test file instead of all tests
2. Use `test.only()` to focus on one test
3. Increase workers in `playwright.config.ts`
4. Check network requests in trace

## Contributing

1. Write tests for new features
2. Update tests when changing features
3. Ensure all tests pass before PR
4. Add regression tests for bugs

## Links

- [Playwright Documentation](https://playwright.dev)
- [TEST_PLAN.md](./TEST_PLAN.md) - Comprehensive test plan
- [WORKPLAN.md](../WORKPLAN.md) - Project workplan
- [CLAUDE.md](../CLAUDE.md) - Project context

## Support

For questions or issues:
- Review [TEST_PLAN.md](./TEST_PLAN.md)
- Check [Playwright docs](https://playwright.dev)
- Open an issue in the repository
