var mqtt = require('mqtt');

var temp = 21;
var acOn = false;
var acHeat = false;

lirc_node = require('lirc_node');
lirc_node.init();

var client  = mqtt.connect('mqtt://localhost:1883');

client.on('connect', function () {
  client.subscribe('control/therm0/#');
});

client.on('message', function (topic, message) {
  topic = topic.split("/")[2];
  if (topic == "set_point"){
     console.log("Updating temp");
     temp = parseInt(message);
     updateAC();
  } else if (topic == "state") {
     if (message == "OFF"){
        console.log("Turnning off aircon");
        lirc_node.irsend.send_once("lgac", "off", function() {console.log("Sent AC off!");});
     } else if (message == "ON"){
        console.log("Turnning on aircon");
        acOn = true;
        updateAC();
     }
  } else if (topic == "heat") {
     if (message == "OFF"){
        console.log("Turnning off aircon heat");
        acHeat = false;
     } else if (message == "ON"){
        console.log("Turnning on aircon heat");
        acHeat = true;
     }
     updateAC();
  }
});

function updateAC(){
   console.log("Updating aircon state");
   if (temp == 24 && heat == false){
     temp = 23; // work around for not having codes for 24C in cool mode
   }
   if (temp == 25 && heat == true){
     temp = 26; // work around for not having codes for 25C in heat mode
   }
   if (acOn){
     command = temp.toString();
     if (acHeat){
       command = "heat" + command
     }
     console.log("Sending command");
     lirc_node.irsend.send_once("lgac", command , function() {console.log("Sent AC " + command);});
   }
}
