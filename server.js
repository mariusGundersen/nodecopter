var http = require('http');
var WebSocket = require('faye-websocket');
var arDrone = require('ar-drone');
var client = arDrone.createClient();
client.disableEmergency();
client.config('general:navdata_demo', 'FALSE');
//client.takeoff();
var battery = -1;
var sockets = [];

function normalizeHeading(heading){
	while(heading < 0) heading += 360;
	while(heading > 360) heading -= 360;
	return heading;
}

var keepHeading = {
	active: false,
	heading: 0,
	on: function(heading){
		if(this.active){
			var currentDir = new Vector(heading);
			var targetDir = new Vector(this.heading);


			var diff = heading - this.heading;

			if(diff < -180){
				diff += 360;
			}else if( diff > 180){
				diff -= 360;
			}
			console.log("diff:", diff.toFixed(2),  (diff/100).toFixed(2));
			if(diff < -5){
				client.clockwise(Math.min(-diff/100, 1));
			}else if(diff > 5){
				client.counterClockwise(Math.min(diff/100, 1));
			}else{
				client.stop();
			}
		}
	}
};

var keepVelocity = {
	active: false,
	velocity: 0,
	current: 0,
	on: function(velocity){
		if(this.active){
			if(velocity < this.velocity){
				current+=0.01;
			}else{
				current-=0.01;
			}
			client.forward(current);
		}
	}
}

var tasks = {
	takeoff: function(){
		this.takeoff();
	},
	land: function(){
		this.land();
	},
	switch: function(channel){
		this.config('video:video_channel', channel);
	},
	switch1: function(){
		this.config('video:video_channel', '1');
	},
	startKeepHeading: function(heading){
		keepHeading.active = true;
		keepHeading.heading = normalizeHeading(heading);
	},
	stopKeepHeading: function(){
		keepHeading.active = false;
		this.stop();
	},
	startKeepVelocity: function(velocity){
		keepVelocity.active = true;
		keepVelocity.velocity = velocity;
	},
	stopkeepVelocity: function(){
		keepVelocity.active = false;
		this.stop();
	}

}

client
	.on('navdata', function(navData){
		var heading = normalizeHeading(navData.magneto.heading.unwrapped);
		var velocity = navData.demo.velocityX;
		battery = navData.demo.batteryPercentage;

		sockets.forEach(function(socket){
  			socket.send(JSON.stringify({heading: heading}));
		});


		keepHeading.on(heading);

		keepVelocity.on(velocity);
	});


var requestListener = function (req, res) {
  require('fs').createReadStream(__dirname + "/index.html").pipe(res);
}

var server = http.createServer(requestListener);
server.listen(8080);


server.addListener('upgrade', function(request, socket, head) {
  var ws = new WebSocket(request, socket, head);
  ws.onopen = function(event){
  	sockets.push(ws);
  	ws.send(JSON.stringify({battery: battery}));
  	console.log("new socket");
  };
  ws.onmessage = function(event) {
  	console.log(event.data);
  	var message = JSON.parse(event.data);
  	if(message.task in tasks){
  		console.log(message.task, message.parameters);
  		tasks[message.task].apply(client, message.parameters);
  	}
  };

  ws.onclose = function(event) {
    console.log('close', event.code, event.reason);
    ws = null;
    sockets = sockets.filter(function(socket){
    	return socket != ws;
    });
  };
});