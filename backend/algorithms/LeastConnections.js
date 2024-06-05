class LeastConnections {
    constructor(servers) {
      this.servers = servers;
    }
  
    getNextServer() {
      return this.servers.reduce((prev, curr) => (prev.connections < curr.connections ? prev : curr));
    }
  }
  
  module.exports = LeastConnections;
  