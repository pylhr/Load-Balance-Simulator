class LeastResponseTime {
    constructor(servers) {
      this.servers = servers;
    }
  
    getNextServer() {
      return this.servers.reduce((prev, curr) => (prev.responseTime < curr.responseTime ? prev : curr));
    }
  }
  
  module.exports = LeastResponseTime;
  