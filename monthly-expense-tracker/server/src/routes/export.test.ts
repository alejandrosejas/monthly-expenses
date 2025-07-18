import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { services } from '../services';
import exportRoutes from './export';
import { errorHandler } from '../middleware';

// Mock the export service
vi.mock('../services', () => {
  return {
    services: {
      export: {
        exportMonthToCSV: vi.fn(),
        exportMonthToPDF: vi.fn()
      }
    }
  };
});

describe('Export Routes', () => {
  let app: express.Express;
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Create express app for testing
    app = express();
    app.use(express.json());
    app.use('/api/export', exportRoutes);
    app.use(errorHandler);
  });
  
  describe('GET /api/export/csv/:month', () => {
    it('should return CSV data with correct headers', async () => {
      // Mock the service response
      const mockCSV = 'Date,Amount,Category,Description,Payment Method\n2023-01-01,100.00,Food,Groceries,cash';
      (services.export.exportMonthToCSV as any).mockResolvedValue(mockCSV);
      
      // Make request
      const response = await request(app)
        .get('/api/export/csv/2023-01')
        .expect(200);
      
      // Check service was called with correct parameters
      expect(services.export.exportMonthToCSV).toHaveBeenCalledWith('2023-01');
      
      // Check response headers
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment; filename="expenses-2023-01.csv"');
      
      // Check response body
      expect(response.text).toBe(mockCSV);
    });
    
    it('should return 400 for invalid month format', async () => {
      // Make request with invalid month format
      const response = await request(app)
        .get('/api/export/csv/invalid-month')
        .expect(400);
      
      // Check service was not called
      expect(services.export.exportMonthToCSV).not.toHaveBeenCalled();
      
      // Check error response
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toContain('Month must be in YYYY-MM format');
    });
  });
  
  describe('GET /api/export/pdf/:month', () => {
    it('should return PDF data with correct headers', async () => {
      // Mock the service response
      const mockPDF = Buffer.from('PDF content');
      (services.export.exportMonthToPDF as any).mockResolvedValue(mockPDF);
      
      // Make request
      const response = await request(app)
        .get('/api/export/pdf/2023-01')
        .expect(200);
      
      // Check service was called with correct parameters
      expect(services.export.exportMonthToPDF).toHaveBeenCalledWith('2023-01');
      
      // Check response headers
      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment; filename="expenses-2023-01.pdf"');
      expect(response.headers['content-length']).toBe(mockPDF.length.toString());
      
      // Check response body
      expect(response.body).toEqual(expect.any(Buffer));
    });
    
    it('should return 400 for invalid month format', async () => {
      // Make request with invalid month format
      const response = await request(app)
        .get('/api/export/pdf/invalid-month')
        .expect(400);
      
      // Check service was not called
      expect(services.export.exportMonthToPDF).not.toHaveBeenCalled();
      
      // Check error response
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toContain('Month must be in YYYY-MM format');
    });
  });
});