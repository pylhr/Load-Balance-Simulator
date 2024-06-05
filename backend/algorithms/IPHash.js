const crypto = require('crypto');

class IPHash {
  constructor(servers) {
    this.servers = servers;
  }

  getNextServer(ip) {
    const hash = crypto.createHash('md5').update(ip).digest('hex');
    const index = parseInt(hash, 16) % this.servers.length;
    return this.servers[index];
  }
}

module.exports = IPHash;
