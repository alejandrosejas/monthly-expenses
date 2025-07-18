# Design Document

## Overview

The Monthly Expense Tracker will be built as a modern web application using React for the frontend and Node.js with Express for the backend. The application will use SQLite as the database for simplicity and portability, with a RESTful API architecture. The design emphasizes responsive design, real-time updates, and professional data visualization.

## Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Tailwind CSS for styling
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: SQLite with better-sqlite3 for performance
- **Charts**: Chart.js with react-chartjs-2 for analytics
- **Date Handling**: date-fns for date manipulation
- **Validation**: Zod for schema validation
- **Build Tools**: Vite for frontend, tsx for backend development

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express API    │◄──►│  SQLite DB      │
│   (Frontend)    │    │   (Backend)     │    │   (Storage)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Project Structure
```
monthly-expense-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Server utilities
│   └── package.json
└── shared/                # Shared types and utilities
```

## Components and Interfaces

### Core Data Models

#### Expense Model
```typescript
interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
  paymentMethod: 'cash' | 'credit' | 'debit' | 'transfer';
  createdAt: Date;
  updatedAt: Date;
}
```

#### Category Model
```typescript
interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
}
```

#### Budget Model
```typescript
interface Budget {
  id: string;
  month: string; // YYYY-MM format
  totalBudget: number;
  categoryBudgets: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Frontend Components

#### Core Components
- **ExpenseForm**: Form for adding/editing expenses with validation
- **ExpenseList**: Displays expenses with sorting and filtering
- **ExpenseItem**: Individual expense row with edit/delete actions
- **CategoryManager**: Interface for managing expense categories
- **BudgetTracker**: Visual budget progress indicators
- **MonthNavigator**: Month selection and navigation controls

#### Analytics Components
- **ExpenseChart**: Pie chart for category breakdown
- **TrendChart**: Line chart for spending trends over time
- **BudgetProgress**: Progress bars and alerts for budget status
- **SummaryCards**: Key metrics display (total spent, remaining budget, etc.)

#### Layout Components
- **Header**: Navigation and month selector
- **Sidebar**: Category filters and quick actions
- **MobileMenu**: Responsive navigation for mobile devices

### API Endpoints

#### Expense Management
- `GET /api/expenses` - Get expenses with filtering and pagination
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update existing expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary/:month` - Get monthly summary

#### Category Management
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

#### Budget Management
- `GET /api/budgets/:month` - Get budget for specific month
- `POST /api/budgets` - Create/update monthly budget
- `GET /api/budgets/:month/status` - Get budget status and alerts

#### Analytics
- `GET /api/analytics/category-breakdown/:month` - Category spending breakdown
- `GET /api/analytics/trends` - Spending trends over time
- `GET /api/analytics/comparison/:month1/:month2` - Month comparison

#### Export
- `GET /api/export/csv/:month` - Export month data as CSV
- `GET /api/export/pdf/:month` - Generate PDF report

## Data Models

### Database Schema

#### expenses table
```sql
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

#### categories table
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  is_default INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
```

#### budgets table
```sql
CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  month TEXT UNIQUE NOT NULL,
  total_budget REAL NOT NULL,
  category_budgets TEXT NOT NULL, -- JSON string
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Data Validation

#### Expense Validation Schema
```typescript
const ExpenseSchema = z.object({
  date: z.string().datetime(),
  amount: z.number().positive().max(999999.99),
  category: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  paymentMethod: z.enum(['cash', 'credit', 'debit', 'transfer'])
});
```

## Error Handling

### Frontend Error Handling
- **Form Validation**: Real-time validation with user-friendly error messages
- **API Errors**: Toast notifications for API failures with retry options
- **Network Issues**: Offline detection with queue for pending operations
- **Data Loading**: Loading states and skeleton screens for better UX

### Backend Error Handling
- **Validation Errors**: Return 400 with detailed field-level errors
- **Database Errors**: Log errors and return generic 500 responses
- **Not Found**: Return 404 for missing resources
- **Rate Limiting**: Implement basic rate limiting for API endpoints

### Error Response Format
```typescript
interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
}
```

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Jest and React Testing Library for component testing
- **Integration Tests**: Test API integration and user workflows
- **E2E Tests**: Playwright for critical user journeys
- **Visual Tests**: Snapshot testing for UI consistency

### Backend Testing
- **Unit Tests**: Jest for service and utility function testing
- **Integration Tests**: Test API endpoints with test database
- **Database Tests**: Test data models and migrations
- **Performance Tests**: Basic load testing for API endpoints

### Test Coverage Goals
- Minimum 80% code coverage for critical business logic
- 100% coverage for data validation and financial calculations
- E2E tests for all major user workflows

### Testing Data
- Use factory functions to generate test data
- Separate test database for integration tests
- Mock external dependencies and date/time functions

## Security Considerations

### Data Protection
- Input validation and sanitization on all user inputs
- SQL injection prevention through parameterized queries
- XSS protection through proper data encoding

### API Security
- Basic rate limiting to prevent abuse
- Request size limits to prevent DoS attacks
- Proper HTTP headers for security (CORS, CSP)

### Data Privacy
- No sensitive personal data storage beyond expense records
- Local SQLite database keeps data on user's machine
- Optional data export for user control

## Performance Optimization

### Frontend Performance
- Code splitting for faster initial load
- Lazy loading for charts and analytics components
- Memoization for expensive calculations
- Virtual scrolling for large expense lists

### Backend Performance
- Database indexing on frequently queried fields
- Response caching for analytics endpoints
- Pagination for large data sets
- Connection pooling for database access

### Mobile Optimization
- Touch-friendly interface elements
- Optimized images and assets
- Progressive Web App capabilities
- Offline functionality for basic operations