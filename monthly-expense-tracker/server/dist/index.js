"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./database");
const middleware_1 = require("./middleware");
const routes_1 = __importDefault(require("./routes"));
// Initialize express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(middleware_1.requestLogger);
// API Routes
app.use('/api', routes_1.default);
// Error handler (must be last)
app.use(middleware_1.errorHandler);
// Initialize database and start server
async function startServer() {
    try {
        // Initialize database connection
        await (0, database_1.initializeDatabase)();
        // Run migrations to create/update schema
        await (0, database_1.runMigrations)();
        // Seed database with initial data
        await (0, database_1.seedDatabase)();
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API available at http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Start the server
startServer();
