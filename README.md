# Monthly Expense Tracker

A professional full-stack application for tracking and analyzing monthly expenses with budgeting capabilities.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## Features

- **Expense Management**: Add, edit, and delete expenses with categorization
- **Budget Tracking**: Set monthly budgets with category-specific allocations
- **Analytics Dashboard**: Visualize spending patterns with interactive charts
- **Category Management**: Create and customize expense categories
- **Data Export**: Export expense data as CSV or PDF reports
- **Responsive Design**: Fully functional on both desktop and mobile devices
- **Month Navigation**: Easily switch between different months to view historical data
- **Advanced Filtering**: Search and filter expenses by various criteria

## Tech Stack

### Frontend
- **React** with TypeScript
- **React Router** for navigation
- **Chart.js** for data visualization
- **TailwindCSS** for styling
- **Vite** for build tooling
- **Vitest** for unit testing

### Backend
- **Node.js** with Express
- **SQLite** for data storage
- **Zod** for validation
- **PDFKit** for PDF generation

### Shared
- TypeScript types and validation schemas shared between client and server

### Testing
- **Vitest** for unit and integration tests
- **Playwright** for end-to-end testing
- **Testing Library** for React component testing

## Project Structure

```
monthly-expense-tracker/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Utility functions
│   └── ...
├── server/               # Backend Express application
│   ├── src/
│   │   ├── database/     # Database repositories
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Data models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── ...
├── shared/               # Shared code between client and server
│   ├── src/
│   │   ├── types.ts      # Shared TypeScript types
│   │   ├── validation.ts # Zod validation schemas
│   │   └── utils.ts      # Shared utility functions
│   └── ...
└── e2e/                  # End-to-end tests with Playwright
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/monthly-expense-tracker.git
   cd monthly-expense-tracker
   ```

2. Install dependencies
   ```bash
   npm install
   ```

### Development

Run the development server (both frontend and backend):
```bash
npm run dev
```

This will start:
- Frontend at http://localhost:5173
- Backend at http://localhost:3000

### Building for Production

Build all packages:
```bash
npm run build:prod
```

Start the production server:
```bash
npm start
```

## Testing

### Unit and Integration Tests

Run all tests:
```bash
npm test
```

Run tests for specific packages:
```bash
npm run test -w client
npm run test -w server
npm run test -w shared
```

### End-to-End Tests

Run all E2E tests:
```bash
npm run test:e2e
```

Run E2E tests with UI:
```bash
npm run test:e2e:ui
```

## Key Features Explained

### Expense Management
- Add expenses with date, amount, category, description, and payment method
- Edit and delete existing expenses
- Filter expenses by date range, category, amount, and payment method
- Search expenses by description

### Budget Tracking
- Set monthly budget limits overall and per category
- Visual indicators for budget status (normal, warning, exceeded)
- Budget vs. actual spending comparisons

### Analytics
- Category breakdown with pie charts
- Monthly spending trends
- Month-to-month comparisons
- Daily spending patterns

### Data Export
- Export expenses as CSV for spreadsheet analysis
- Generate PDF reports with spending summaries

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request