"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_1 = __importDefault(require("./health"));
const categories_1 = __importDefault(require("./categories"));
const expenses_1 = __importDefault(require("./expenses"));
const budgets_1 = __importDefault(require("./budgets"));
const analytics_1 = __importDefault(require("./analytics"));
const export_1 = __importDefault(require("./export"));
const router = (0, express_1.Router)();
// Register routes
router.use('/health', health_1.default);
router.use('/categories', categories_1.default);
// Special expense routes that need to come before the /:id route
router.get('/expenses/summary/:month', expenses_1.default);
router.get('/expenses/daily/:month', expenses_1.default);
router.get('/expenses/monthly', expenses_1.default);
router.get('/expenses/category/:categoryId', expenses_1.default);
router.get('/expenses/month/:month', expenses_1.default);
// Regular expense routes
router.use('/expenses', expenses_1.default);
// Special budget routes that need to come before the /:month route
router.get('/budgets/range', budgets_1.default);
// Regular budget routes
router.use('/budgets', budgets_1.default);
// Analytics routes
router.use('/analytics', analytics_1.default);
// Export routes
router.use('/export', export_1.default);
exports.default = router;
