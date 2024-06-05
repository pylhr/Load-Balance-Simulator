import React, { useState, useEffect } from 'react';
import './App.css';

const ws = new WebSocket('ws://localhost:8080');

const App = () => {
  const [servers, setServers] = useState([
    { name: 'Server1', weight: 5, connections: 0, responseTime: 1 },
    { name: 'Server2', weight: 1, connections: 0, responseTime: 1 },
    { name: 'Server3', weight: 1, connections: 0, responseTime: 1 }
  ]);
  const [algorithm, setAlgorithm] = useState('RoundRobin');
  const [serverResponse, setServerResponse] = useState('');

  useEffect(() => {
    ws.onmessage = (message) => {
      const { type, payload } = JSON.parse(message.data);
      if (type === 'RESPONSE') {
        setServerResponse(payload.data.message);
        setServers((prevServers) =>
          prevServers.map((server) =>
            server.name === payload.server.name
              ? { ...server, connections: server.connections + 1, responseTime: payload.responseTime }
              : server
          )
        );
      }
      if (type === 'ALGORITHM_SET') {
        console.log(`Algorithm set to ${payload}`);
      }
    };
  }, []);

  const sendRequest = () => {
    ws.send(JSON.stringify({ type: 'REQUEST' }));
  };

  const changeAlgorithm = (algo) => {
    setAlgorithm(algo);
    ws.send(JSON.stringify({ type: 'SET_ALGORITHM', payload: algo }));
  };

  return (
    <div className="App">
      <h1>Load Balancer Simulator</h1>
      <div>
        <label>Select Algorithm: </label>
        <select value={algorithm} onChange={(e) => changeAlgorithm(e.target.value)}>
          <option value="RoundRobin">Round Robin</option>
          <option value="WeightedRoundRobin">Weighted Round Robin</option>
          <option value="LeastConnections">Least Connections</option>
          <option value="LeastResponseTime">Least Response Time</option>
          <option value="IPHash">IP Hash</option>
        </select>
      </div>
      <button onClick={sendRequest}>Send Request</button>
      <div>
        <h2>Server Response:</h2>
        <p>{serverResponse}</p>
      </div>
      <div className="servers">
        {servers.map((server) => (
          <div key={server.name} className="server">
            <h3>{server.name}</h3>
            <p>Connections: {server.connections}</p>
            <p>Weight: {server.weight}</p>
            <p>Response Time: {server.responseTime}ms</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
