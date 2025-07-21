"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const middleware_1 = require("../middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const { export: exportService } = services_1.services;
// Validation schema for month parameter
const MonthParamSchema = zod_1.z.object({
    month: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
});
/**
 * @route GET /api/export/csv/:month
 * @desc Export expenses for a month as CSV
 */
router.get('/csv/:month', (0, middleware_1.validateRequest)({ params: MonthParamSchema }), async (req, res, next) => {
    try {
        const { month } = req.params;
        // Generate CSV content
        const csvContent = await exportService.exportMonthToCSV(month);
        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="expenses-${month}.csv"`);
        // Send CSV content
        res.send(csvContent);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /api/export/pdf/:month
 * @desc Export expenses for a month as PDF
 */
router.get('/pdf/:month', (0, middleware_1.validateRequest)({ params: MonthParamSchema }), async (req, res, next) => {
    try {
        const { month } = req.params;
        // Generate PDF content
        const pdfBuffer = await exportService.exportMonthToPDF(month);
        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="expenses-${month}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        // Send PDF content
        res.send(pdfBuffer);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
