import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { json } from 'express';
import analyticsRoutes from './analytics';
import { AnalyticsService } from '../services/analytics-service';
import { errorHandler } from '../middleware';

// Mock the analytics service
vi.mock('../services/analytics-service', () => {
  return {
    AnalyticsService: vi.fn().mockImplementation(() => ({
      getCategoryBreakdown: vi.fn().mockResolvedValue([
        { category: 'Food', amount: 250, percentage: 50, color: '#FF5733' },
        { category: 'Transport', amount: 150, percentage: 30, color: '#33FF57' },
        { category: 'Entertainment', amount: 100, percentage: 20, color: '#3357FF' }
      ]),
      getMonthlyTotals: vi.fn().mockResolvedValue([
        { month: '2023-01', total: 400 },
        { month: '2023-02', total: 500 },
        { month: '2023-03', total: 600 }
      ]),
      getDailyTotals: vi.fn().mockResolvedValue([
        { date: '2023-03-01', total: 100 },
        { date: '2023-03-15', total: 200 },
        { date: '2023-03-30', total: 300 }
      ]),
      compareMonths: vi.fn().mockResolvedValue([
        {
          category: 'Food',
          currentMonth: { month: '2023-03', amount: 250 },
          previousMonth: { month: '2023-02', amount: 200 },
          difference: 50,
          percentageChange: 25
        },
        {
          category: 'Transport',
          currentMonth: { month: '2023-03', amount: 150 },
          previousMonth: { month: '2023-02', amount: 180 },
          difference: -30,
          percentageChange: -16.67
        }
      ])
    }))
  };
});

describe('Analytics Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(json());
    app.use('/api/analytics', analyticsRoutes);
    app.use(errorHandler);
  });

  describe('GET /api/analytics/category-breakdown/:month', () => {
    it('should return category breakdown for a month', async () => {
      const response = await request(app)
        .get('/api/analytics/category-breakdown/2023-03')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].category).toBe('Food');
      expect(response.body.data[0].amount).toBe(250);
      expect(response.body.data[0].percentage).toBe(50);
    });

    it('should return 400 for invalid month format', async () => {
      await request(app)
        .get('/api/analytics/category-breakdown/invalid-month')
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('GET /api/analytics/monthly-totals/:month', () => {
    it('should return monthly totals', async () => {
      const response = await request(app)
        .get('/api/analytics/monthly-totals/2023-03')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].month).toBe('2023-01');
      expect(response.body.data[0].total).toBe(400);
    });

    it('should return 400 for invalid month format', async () => {
      await request(app)
        .get('/api/analytics/monthly-totals/invalid-month')
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('GET /api/analytics/daily-totals/:month', () => {
    it('should return daily totals for a month', async () => {
      const response = await request(app)
        .get('/api/analytics/daily-totals/2023-03')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].date).toBe('2023-03-01');
      expect(response.body.data[0].total).toBe(100);
    });

    it('should return 400 for invalid month format', async () => {
      await request(app)
        .get('/api/analytics/daily-totals/invalid-month')
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('GET /api/analytics/compare/:currentMonth/:previousMonth', () => {
    it('should return comparison between two months', async () => {
      const response = await request(app)
        .get('/api/analytics/compare/2023-03/2023-02')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].category).toBe('Food');
      expect(response.body.data[0].difference).toBe(50);
      expect(response.body.data[0].percentageChange).toBe(25);
    });

    it('should return 400 for invalid month format', async () => {
      await request(app)
        .get('/api/analytics/compare/invalid-month/2023-02')
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });
});