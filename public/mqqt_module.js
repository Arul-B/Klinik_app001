//mqtt
var mqtt = require('mqtt'), url = require('url');
// Parse
var mqtt_url = url.parse(process.env.CLOUDAMQP_MQTT_URL || 'mqtt://localhost:1883');
var auth = (mqtt_url.auth || ':').split(':');
var url = "mqtt://" + mqtt_url.host;

var options = {
  port: mqtt_url.port,
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  //username: auth[0],
  //password: auth[1],
};
// Create a client connection
var client = mqtt.connect(url, options);

client.subscribe('/hello')
client.on('message', function (topic, message){
  console.log(ab2str(message))
})

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}
module.exports = client