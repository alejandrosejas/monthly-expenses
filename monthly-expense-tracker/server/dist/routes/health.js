"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
/**
 * @route GET /api/health
 * @desc Check API health
 * @access Public
 */
router.get('/', (req, res) => {
    const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    };
    return (0, utils_1.sendSuccess)(res, healthData, 'API is healthy');
});
exports.default = router;
