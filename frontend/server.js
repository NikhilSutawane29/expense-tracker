const express = require('express');
const path = require('path');
const net = require('net');

const app = express();
let PORT = process.env.PORT || 3002;

// Function to check if a port is in use
function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

// Function to find an available port
async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await isPortFree(port))) {
    console.log(`Port ${port} is already in use, trying next port...`);
    port++;
    if (port > startPort + 20) {
      console.error('Could not find an available port after trying 20 ports.');
      process.exit(1);
    }
  }
  return port;
}

// Serve static files
app.use(express.static(__dirname));

// Add endpoint to get current port
app.get('/api/port', (req, res) => {
  res.json({ port: PORT });
});

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle all routes to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server with port finding logic
async function startServer() {
  try {
    PORT = await findAvailablePort(PORT);
    
    app.listen(PORT, () => {
      console.log(`Frontend server running on port ${PORT}`);
      console.log(`Open http://localhost:${PORT} in your browser`);
      
      // Update API_URL in a global variable that can be accessed by client code
      global.API_PORT = PORT;
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

startServer(); 