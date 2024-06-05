class WeightedRoundRobin {
    constructor(servers) {
      this.servers = servers;
      this.currentWeight = 0;
      this.maxWeight = Math.max(...servers.map(server => server.weight));
      this.gcdWeight = this.gcd(servers.map(server => server.weight));
      this.currentIndex = -1;
    }
  
    gcd(weights) {
      const gcdTwoNumbers = (a, b) => {
        if (!b) return a;
        return gcdTwoNumbers(b, a % b);
      };
      return weights.reduce((a, b) => gcdTwoNumbers(a, b));
    }
  
    getNextServer() {
      while (true) {
        this.currentIndex = (this.currentIndex + 1) % this.servers.length;
        if (this.currentIndex === 0) {
          this.currentWeight = this.currentWeight - this.gcdWeight;
          if (this.currentWeight <= 0) {
            this.currentWeight = this.maxWeight;
            if (this.currentWeight === 0) return null;
          }
        }
        if (this.servers[this.currentIndex].weight >= this.currentWeight) {
          return this.servers[this.currentIndex];
        }
      }
    }
  }
  
  module.exports = WeightedRoundRobin;
  