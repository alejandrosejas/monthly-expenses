#!/usr/bin/env node

/**
 * Simple integration test to verify basic functionality
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

let serverProcess = null;
let clientProcess = null;

// Cleanup function
function cleanup() {
  console.log('Cleaning up processes...');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  if (clientProcess) {
    clientProcess.kill('SIGTERM');
  }
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function waitForServer(port, timeout = 30000) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
          resolve(res);
        });
        req.on('error', reject);
        req.setTimeout(1000);
      });
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

async function testBasicFunctionality() {
  console.log('Starting integration test...');
  
  try {
    // Start server
    console.log('Starting server...');
    serverProcess = spawn('npm', ['run', 'dev:server'], {
      cwd: path.join(__dirname),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });
    
    // Wait for server to start
    console.log('Waiting for server to start...');
    const serverReady = await waitForServer(4000);
    
    if (!serverReady) {
      throw new Error('Server failed to start within timeout');
    }
    
    console.log('Server is ready!');
    
    // Test API endpoints
    console.log('Testing API endpoints...');
    
    // Test categories endpoint
    try {
      const categoriesResponse = await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:4000/api/categories', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
        req.setTimeout(5000);
      });
      
      console.log(`Categories API: ${categoriesResponse.status}`);
      if (categoriesResponse.status === 200) {
        console.log('✓ Categories API working');
      } else {
        console.log('✗ Categories API failed');
      }
    } catch (error) {
      console.log('✗ Categories API error:', error.message);
    }
    
    // Test expenses endpoint
    try {
      const expensesResponse = await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:4000/api/expenses', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
        req.setTimeout(5000);
      });
      
      console.log(`Expenses API: ${expensesResponse.status}`);
      if (expensesResponse.status === 200) {
        console.log('✓ Expenses API working');
      } else {
        console.log('✗ Expenses API failed');
      }
    } catch (error) {
      console.log('✗ Expenses API error:', error.message);
    }
    
    console.log('Integration test completed!');
    
  } catch (error) {
    console.error('Integration test failed:', error);
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Run the test
testBasicFunctionality();