# End-to-End Tests

This directory contains comprehensive end-to-end tests for the Monthly Expense Tracker application using Playwright.

## Test Files

- `expense-management.spec.ts` - Tests for adding, editing, deleting, and managing expenses
- `budget-management.spec.ts` - Tests for budget setting and tracking functionality
- `analytics-and-export.spec.ts` - Tests for analytics charts and data export features
- `mobile-responsiveness.spec.ts` - Tests for mobile device compatibility
- `complete-user-journey.spec.ts` - Comprehensive integration tests covering full user workflows

## Running Tests

### Prerequisites
- Node.js and npm installed
- Application dependencies installed (`npm install`)

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test expense-management.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium
```

## Test Data

Tests use realistic test data including:
- Sample expenses with various categories
- Budget scenarios with warnings and overages
- Multiple months of data for trend analysis
- Mobile and desktop viewport testing

## Key Features Tested

### Expense Management
- ✅ Adding new expenses with validation
- ✅ Editing existing expenses
- ✅ Deleting expenses with confirmation
- ✅ Search and filtering functionality
- ✅ Form validation and error handling

### Budget Management
- ✅ Setting monthly budgets
- ✅ Category-specific budgets
- ✅ Budget warnings at 80% threshold
- ✅ Budget exceeded alerts

### Analytics & Export
- ✅ Category breakdown charts
- ✅ Spending trend visualization
- ✅ CSV data export
- ✅ PDF report generation
- ✅ Monthly summaries

### Mobile Responsiveness
- ✅ Touch-friendly interface
- ✅ Responsive layouts
- ✅ Mobile navigation
- ✅ Proper button sizing for touch

### Integration
- ✅ Complete user workflows
- ✅ Data persistence
- ✅ Error handling
- ✅ Cross-browser compatibility

## Test Configuration

Tests are configured to:
- Run against multiple browsers (Chrome, Firefox, Safari)
- Test both desktop and mobile viewports
- Automatically start development servers
- Capture screenshots on failure
- Generate HTML reports

## Debugging

- Use `--debug` flag to run tests in debug mode
- Screenshots and videos are captured on test failures
- HTML reports provide detailed test results and traces