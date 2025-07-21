"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositories = exports.BudgetRepository = exports.ExpenseRepository = exports.CategoryRepository = exports.BaseRepository = exports.seedDatabase = exports.runMigrations = exports.closeDatabase = exports.getDatabase = exports.initializeDatabase = void 0;
// Export database connection functions
var connection_1 = require("./connection");
Object.defineProperty(exports, "initializeDatabase", { enumerable: true, get: function () { return connection_1.initializeDatabase; } });
Object.defineProperty(exports, "getDatabase", { enumerable: true, get: function () { return connection_1.getDatabase; } });
Object.defineProperty(exports, "closeDatabase", { enumerable: true, get: function () { return connection_1.closeDatabase; } });
Object.defineProperty(exports, "runMigrations", { enumerable: true, get: function () { return connection_1.runMigrations; } });
Object.defineProperty(exports, "seedDatabase", { enumerable: true, get: function () { return connection_1.seedDatabase; } });
// Export repositories
var base_repository_1 = require("./base-repository");
Object.defineProperty(exports, "BaseRepository", { enumerable: true, get: function () { return base_repository_1.BaseRepository; } });
var category_repository_1 = require("./category-repository");
Object.defineProperty(exports, "CategoryRepository", { enumerable: true, get: function () { return category_repository_1.CategoryRepository; } });
var expense_repository_1 = require("./expense-repository");
Object.defineProperty(exports, "ExpenseRepository", { enumerable: true, get: function () { return expense_repository_1.ExpenseRepository; } });
var budget_repository_1 = require("./budget-repository");
Object.defineProperty(exports, "BudgetRepository", { enumerable: true, get: function () { return budget_repository_1.BudgetRepository; } });
// Export repository instances
exports.repositories = {
    category: new CategoryRepository(),
    expense: new ExpenseRepository(),
    budget: new BudgetRepository()
};
