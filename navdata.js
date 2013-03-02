
var arDrone = require('ar-drone');
var client = arDrone.createClient();
client.config('general:navdata_demo', 'FALSE');
client.takeoff();
var battery = -1;
client
	.after(5000, function(){
		this.on('navdata', function(navData){
			var heading = navData.magneto.heading.unwrapped;
			battery = navData.demo.batteryPercentage;
			while(heading < 180) heading += 360;
			while(heading > 180) heading -= 360;

			//console.log(heading);
		});
		this.clockwise(0.5);
	})
	.after(1000, function(){
		console.log("stop, battery: " + battery);
		this.stop();
		this.land();
	});