import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import healthRoutes from './health';
import { errorHandler } from '../middleware';

describe('Health API', () => {
  const app = express();
  
  // Setup test app
  beforeAll(() => {
    app.use(express.json());
    app.use('/api/health', healthRoutes);
    app.use(errorHandler);
  });
  
  it('should return health status', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.timestamp).toBeDefined();
    expect(response.body.data.uptime).toBeDefined();
    expect(response.body.message).toBe('API is healthy');
  });
});