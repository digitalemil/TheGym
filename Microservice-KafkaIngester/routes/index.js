var express = require('express');
var router = express.Router();
var avro = require('avro-js');
let json= new String(process.env.APPDEF);
json= json.replace(/\'/g, '\"');

let appdef= JSON.parse(json);
let fields= new Array(); 
let types= new Array();
for(var i= 0; i< appdef.fields.length; i++) {
  fields[i] = appdef.fields[i].name;
  types[i] = appdef.fields[i].type;
}

function avroTypeForMyType(t) {
  if(t === "String") 
    return "string";
  if(t === "Integer") 
    return "int";
  if(t === "Long") 
    return "long";
  if(t === "Double") 
    return "double";
  if(t === "Boolean") 
    return "boolean";
  if(t === "Date/Time" || t === "Date/time") 
    return "string";
  if(t === "Location") 
    return "string";
};

let typeobj= new Object();
typeobj.name= 'hr';
typeobj.type= 'record';
typeobj.fields = new Array();
for(var i= 0; i< fields.length; i++) {
  typeobj.fields[i]= new Object();
  typeobj.fields[i].name= fields[i];
  typeobj.fields[i].type= avroTypeForMyType(types[i]);
}
console.log("Avro Type (json): "+ JSON.stringify(typeobj));
console.log(typeobj)
let type= avro.parse(typeobj);
//console.log("Avro: "+type.toBuffer(JSON.parse('{"id":1542899996666,"location":"32.7152778,-117.1563889","event_timestamp":"2018-11-22T15:19:00.663Z","deviceid":"17445","user":"Travis","heartrate":113,"color":"0x80FFFFFF"}')));

var kafka = require('kafka-node');
var Consumer = kafka.Consumer;
var Producer= kafka.Producer;

let kafka_dns= process.env.KAFKA_SERVICE;
//kafka_dns= "master.mesos:2181/dcos-service-kafka";
var kafka_client = new kafka.Client(kafka_dns);
console.log("Kafka client: "+JSON.stringify(kafka_client));
let topic= appdef.topic;

var producer = new Producer(kafka_client);
producer.on('error', function (err) {
  console.log("Kafka producer on error()");
  console.log(err);
})
producer.on('ready', function () {
  console.log("Producer ready.");
      producer.createTopics([topic], false, function (err, data) {
        console.log("Topic: "+topic+" created or existed already");
      });
});
var app = express();
app.set("producer", producer);
  

/*
setTimeout(function() {
var consumer = new Consumer(
    kafka_client,
    [
      { topic: topic, offset: 0}
    ],
    {
      fromOffset: true
    }
  );

consumer.on('message', function (message) {
  console.log("Kafka, received message: ", message);
});
}, 6000);
*/

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Kafka Worker", client: kafka_client.json, topic: producer.topic, appdef: JSON.stringify(appdef)
    });
});

router.post('/data', function(req, res, next) {
 
  try {
 //   console.log(req.body);
    payloads= [ { topic: topic, messages: req.body.data/*type.toBuffer(JSON.parse(req.body.data))*/, partition: 0 } ];
    //payloads= req.body.data;
  //  console.log("About to send Kafka payload: "+JSON.stringify(req.body.data));
 // console.log("Producer: "+JSON.stringify(producer));
 // console.log("Payload: "+JSON.stringify(payloads));
 console.log("Payload: "+payloads);
  producer.send(payloads, function (err, data) {      
        console.log("Kafka payload sent: "+JSON.stringify(data));
        if(err== null) {
           res.statusCode= 200;
        }
        else {
           console.log(err)
           res.status= 503;
        }
        res.end();
    }); 
  }
  catch(err1) {
    console.log(err1);
  }
});

module.exports = router;
