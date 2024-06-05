const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const RoundRobin = require('./algorithms/RoundRobin');
const WeightedRoundRobin = require('./algorithms/WeightedRoundRobin');
const LeastConnections = require('./algorithms/LeastConnections');
const LeastResponseTime = require('./algorithms/LeastResponseTime');
const IPHash = require('./algorithms/IPHash');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let servers = [
  { url: 'http://localhost:3001', name: 'Server1', weight: 5, connections: 0, responseTime: 100 },
  { url: 'http://localhost:3002', name: 'Server2', weight: 1, connections: 0, responseTime: 200 },
  { url: 'http://localhost:3003', name: 'Server3', weight: 1, connections: 0, responseTime: 300 }
];

let currentAlgorithm = new RoundRobin(servers);

app.get('/', (req, res) => {
  res.send('Load Balancer Simulator Backend');
});

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const { type, payload } = JSON.parse(message);

    if (type === 'REQUEST') {
      const server = currentAlgorithm.getNextServer();
      server.connections += 1;

      try {
        const start = Date.now();
        const response = await axios.get(server.url);
        const end = Date.now();

        const responseTime = end - start;
        server.responseTime = responseTime;

        ws.send(JSON.stringify({ type: 'RESPONSE', payload: { server, responseTime, data: response.data } }));
      } catch (error) {
        server.connections -= 1;  // Rollback the connection count if there is an error
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Error connecting to server', error: error.message } }));
      }
    }

    if (type === 'SET_ALGORITHM') {
      switch (payload) {
        case 'RoundRobin':
          currentAlgorithm = new RoundRobin(servers);
          break;
        case 'WeightedRoundRobin':
          currentAlgorithm = new WeightedRoundRobin(servers);
          break;
        case 'LeastConnections':
          currentAlgorithm = new LeastConnections(servers);
          break;
        case 'LeastResponseTime':
          currentAlgorithm = new LeastResponseTime(servers);
          break;
        case 'IPHash':
          currentAlgorithm = new IPHash(servers);
          break;
        default:
          currentAlgorithm = new RoundRobin(servers);
      }
      ws.send(JSON.stringify({ type: 'ALGORITHM_SET', payload: payload }));
    }

    if (type === 'RELEASE_CONNECTION') {
      const { serverName } = payload;
      const server = servers.find(s => s.name === serverName);
      if (server) server.connections -= 1;
    }
  });
});

server.listen(8080, () => {
  console.log('Server is running on port 8080');
});
