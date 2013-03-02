var http = require('http');
var requestListener = function (req, res) {
  require('fs').createReadStream(__dirname + "/index.html").pipe(res);
}

var server = http.createServer(requestListener);
server.listen(8080);