var
  net = require('net')
  ;

module.exports = function() {
  this.socket = new net.Socket();
  return {
    createClient: function(port, host) {
    }
  }
}
