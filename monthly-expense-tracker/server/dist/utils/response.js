"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendPaginated = sendPaginated;
exports.sendCreated = sendCreated;
exports.sendNoContent = sendNoContent;
/**
 * Send a successful API response
 */
function sendSuccess(res, data, message, statusCode = 200) {
    const response = {
        data,
        message
    };
    return res.status(statusCode).json(response);
}
/**
 * Send a paginated API response
 */
function sendPaginated(res, data, total, page, limit, message) {
    const response = {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        },
        message
    };
    return res.status(200).json(response);
}
/**
 * Send a created response (201)
 */
function sendCreated(res, data, message = 'Resource created successfully') {
    return sendSuccess(res, data, message, 201);
}
/**
 * Send a no content response (204)
 */
function sendNoContent(res) {
    return res.status(204).end();
}
