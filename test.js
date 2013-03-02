// _089206


var arDrone = require('ar-drone');
var client = arDrone.createClient();

console.log("hello");
client.takeoff();

client
  .after(5000, function() {
    this.clockwise(0.5);
  })
  /*.after(2000, function() {
    this.stop();
    this.up(0.5);
  })*/
  .after(2000, function() {
    this.stop();
    this.animate('wave', 15);
  })
  .after(2000, function() {
    this.stop();
  })
  /*.after(2000, function() {
    this.down(0.5);
  })*/
  .after(2000, function() {
    this.stop();
  })
  .after(5000, function() {
    this.stop();
    this.land();
  });