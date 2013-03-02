var net = require('net');

var client = net.connect({host: '192.168.1.1', port: 23}, function() {
	console.log('connected');
});
client.on('data', function(buf) {
	console.log(buf);
})