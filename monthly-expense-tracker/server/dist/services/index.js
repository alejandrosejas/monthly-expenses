"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.services = exports.ExportService = exports.AnalyticsService = exports.BudgetService = exports.CategoryService = exports.ExpenseService = void 0;
const expense_service_1 = require("./expense-service");
Object.defineProperty(exports, "ExpenseService", { enumerable: true, get: function () { return expense_service_1.ExpenseService; } });
const category_service_1 = require("./category-service");
Object.defineProperty(exports, "CategoryService", { enumerable: true, get: function () { return category_service_1.CategoryService; } });
const budget_service_1 = require("./budget-service");
Object.defineProperty(exports, "BudgetService", { enumerable: true, get: function () { return budget_service_1.BudgetService; } });
const analytics_service_1 = require("./analytics-service");
Object.defineProperty(exports, "AnalyticsService", { enumerable: true, get: function () { return analytics_service_1.AnalyticsService; } });
const export_service_1 = require("./export-service");
Object.defineProperty(exports, "ExportService", { enumerable: true, get: function () { return export_service_1.ExportService; } });
// Export service instances
exports.services = {
    expense: new expense_service_1.ExpenseService(),
    category: new category_service_1.CategoryService(),
    budget: new budget_service_1.BudgetService(),
    analytics: new analytics_service_1.AnalyticsService(new expense_service_1.ExpenseService().repository, new category_service_1.CategoryService().repository),
    export: new export_service_1.ExportService(new expense_service_1.ExpenseService().repository, new category_service_1.CategoryService().repository, new budget_service_1.BudgetService().repository, new analytics_service_1.AnalyticsService(new expense_service_1.ExpenseService().repository, new category_service_1.CategoryService().repository))
};
