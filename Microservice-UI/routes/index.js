var express = require('express');
var router = express.Router();
var app = express();
var url= require('url');
var request = require('request');
var http = require("http");
var http2 = require("http").Server(app);
var fs = require('fs');
var formidable = require('formidable');

let lastversion= null;
let lastsecret= null;

let modeltopic= "model";
let hrdatatopic= "hr";
let modelevaluator= process.env.MODELEVALUATOR;
let model= "";
let json= new String(process.env.APPDEF);
json= json.replace(/\'/g, '\"');
let appdef= JSON.parse(json);
let fields= new Array(); 
let types= new Array();
let kibanaurl;

for(var i= 0; i< appdef.fields.length; i++) {
  fields[i] = appdef.fields[i].name;
  types[i] = appdef.fields[i].type;
}

var messages= new Object();
var nmessages= 0;
var messageoffset= -1;
let listener= process.env.LISTENER;
//let cas_contact= "node-0.cassandra.mesos:9042,node-1.cassandra.mesos:9042,node-2.cassandra.mesos:9042";

//var kafka = require('kafka-node');
//let kafka_dns= process.env.KAFKA_SERVICE;
//kafka_dns= "master.mesos:2181/dcos-service-kafka";
//var kafka_client = new kafka.Client(kafka_dns);
//console.log("Kafka client: "+JSON.stringify(kafka_client));
//let Producer= kafka.Producer;
//let producer = new Producer(new kafka.Client(kafka_dns));
//let Consumer = kafka.Consumer;
let modelconsumer= null;
let hrdataconsumer= null;

var net = require('net'); 
var HOST = '127.0.0.1'; // parameterize the IP of the Listen 
var PORT = 6969; // TCP LISTEN port 

net.createServer(function(sock) { // Receives a connection - a socket object is associated to the connection automatically 
  console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort); // Add a 'data' - "event handler" in this socket instance 
  uisocket= sock;
  sock.on('data', function(data) { // data was received in the socket // Writes the received message back to the socket (echo) 
   
    try {
      let msgs= (String.fromCharCode.apply(null, new Uint16Array(data))).split("}");
      let l = msgs.length;
      console.log("Array length"+l );

      for (var i = 0; i <l; i++) {
        try {
          if(msgs[i].length<2)
            continue;
        let jsonstr= msgs[i] +"}";
        //jsonstr= jsonstr.replace('\\','');
        console.log("HRData via UIUpdater: "+jsonstr);
        let jsonobj= JSON.parse(jsonstr);
        jsonobj.model= model;
        let user= jsonobj.user;
        messages[user]= jsonobj;
        postToPMMLEvaluator(jsonobj, false);
        console.log("Received kafka data from uiupdater: "+jsonstr);
        }
        catch(e) { 
          console.log("Can't process msg: "+e);
        }
    }
  }
    catch(e) {
      console.log(e);
    }
  }); 
  sock.on('close', function(data) { // closed connection 
      console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort); 
  }); 
}).listen(PORT, HOST);


   
router.get('/arch.html', function(req, res, next) {
  res.render('architecture', { title: 'The Gym' });
});

router.get('/zeppelin.html', function(req, res, next) {
  let obj= require("/"+process.env.APPDIR+"/jupyternotebook.json");
  let txt= JSON.stringify(obj).replace(/TOPIC/g, appdef.topic);
  txt= txt.replace(/TABLE/g, appdef.table);
  txt= txt.replace(/APPNAME/g, appdef.name);
  let l1= "";
  let l2= "";
  for(let i= 0; i< fields.length; i++) {
    l1+= "(msg \\\\ \\\""+fields[i]+"\\\").as[String]";
    l2+= "\\\""+fields[i]+"\\\"";
      if(i< fields.length-1) {
        l1+= ", ";
        l2+= ", ";
    }
  }

  txt= txt.replace(/REPLACE1/g, l1);
  txt= txt.replace(/REPLACE2/g, l2);

  res.setHeader('Content-disposition', 'attachment; filename=notebook.ipynb');
  res.write(txt);
  res.end();
});

router.get('/version.html', function(req, res, next) {
  let appsecret= "";
  let version= "";
  
  try {
    request.get(process.env.UIVERSION+"/version", function(err, response, body) {
      if(err==null) {
        let result= body.split(",");
        version= result[0];
        appsecret= result[1];
        lastversion= version;
        lastsecret= appsecret;
      }
      else {
        console.log(err);
        if(lastversion== null) {
          version= "1.0.0";
        }
        else {
          version= lastversion;
        }
        if(lastsecret== null) {
            appsecret= "";
        }
        else { 
            appsecret= lastsecret;
        }
      }
      console.log("Version "+version);
      console.log("body: "+body);
      res.render('version', { secret: appsecret, version: version});    
    });
  }
  catch(ex) {
    if(lastversion== null) {
      version= "1.0.0";
    }
    else {
      version= lastversion;
    }
    if(lastsecret== null) {
      appsecret= "";
    }
    else { 
      appsecret= lastsecret;
    }

    console.log("CATCH Version "+version);  
    res.render('version', { secret: appsecret, version: version});  
  }
});

router.get('/', function(req, res, next) {
  let pn= process.env.PUBLICNODE+":10339";
  let pnlg= process.env.PUBLICNODE+":10081";
  let appsecret= process.env.APPSECRET;
  let nurl= process.env.NOTEBOOK_URL;
 
  if(appsecret==undefined) {
    appsecret="Secret undefined. Please set the APPSECRET environment variable.";
  }

  res.render('index', { title: appdef.name, name:appdef.name, publicnodekibana: pn, publicnodelg: pnlg, secret: appsecret, notebookurl: nurl});
});

router.get('/senddata*', function(req, res, next) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  console.log("UI /data: "+query.json);
  console.log("POST: "+listener);
  request.post(listener, {form:query.json}, function(err, response, body) {
  if(err==null) {
    res.statusCode= 200;  
  }
  else {
    res.statusCode= 503;
  }
});
});

router.get('/dashboard.html', function(req, res, next) {
  res.render('dashboard', { table: appdef.table, keyspace: appdef.keyspace, dashboardurl: kibanaurl});
});

router.get('/notebookinframe.html', function(req, res, next) {
  let nurl= process.env.NOTEBOOK_URL;
  console.log("Notebook target: "+nurl);
  
  res.render('notebookinframe', { table: appdef.table, keyspace: appdef.keyspace, notebookurl: nurl});
});

router.get('/loaderinframe.html', function(req, res, next) {
  let pnlg= process.env.PUBLICNODE+":10081";
  res.render('loaderinframe', { publicnodelg: pnlg});
});


router.get('/home.html', function(req, res, next) {
  res.render('home', { table: appdef.table, keyspace: appdef.keyspace});
});

router.get('/cassandra.html', function(req, res, next) {
  res.render('cassandra', { table: appdef.table, keyspace: appdef.keyspace});
});

router.get('/kafka.html', function(req, res, next) {
  let pn= process.env.PUBLICNODE;
  res.render('kafka', { table: appdef.table, keyspace: appdef.keyspace, publicnode: pn});
});

router.get('/map.html', function(req, res, next) {
  res.render('map', { table: appdef.table, keyspace: appdef.keyspace, name:""});
});

router.all('/sethostnameandport', function(req, res, next) {
  console.log(req.body);
  let jsonmsg;
  try {
    jsonmsg= JSON.parse(req.body);
  }
  catch(ex) {
    console.log(ex);
    sendError(res, 0);
    return;
  }
 
  if(! (jsonmsg.name=== "kibana")) {
    kibanaurl= jsonmsg.value;  
  }
  console.log("Kibana: "+kibanaurl);
  res.render('ok');
});

router.get('/cql', function(req, res, next) {
  let url_parts = url.parse(req.url, true);
  let query = url_parts.query;
  let cql= query.cmd;
  console.log("cql: "+cql);
  cas_client.execute(cql, function (err, result) {
           if (!err){
               if ( result.rows.length > 0 ) {
                   for(let r= 0; r< result.rows.length; r++) {
                      console.log(JSON.stringify(result.rows[r]));
                      res.write(JSON.stringify(result.rows[r])+"\n\n");
                   }
               } else {
                   console.log("Cassandra data: No results");
               }
           }
           else {
             console.log(err);
           }
           res.end();
});
});

router.get('/mapdata', function(req, res, next) {
  let data= new Object();
  data.total= nmessages;
  data.locations= new Array();
  console.log("Data: "+JSON.stringify(data));

  let j= 0;
   let now= new Date().getTime();
   let maxoffset= 0;
  for(var key in messages) {
    let location= new Object();
    let dt= location.event_timestamp;
    let ms= new Date(dt).getTime();
    if(now> ms + 1000*60) {
      delete messages.key;
      continue;
    }
    let latlong=  messages[key].location.split(",");
    location.latitude= latlong[0];
    location.longitude= latlong[1];
    location.n= 1;
    data.locations[j++]= location;
   // console.log(messages[i]);
   // if(!(messages[i]== undefined) && messages[i].offset> maxoffset)
   //   maxoffset= messages[i].offset;
  }
  data.maxoffset= maxoffset;
  console.log("MapData: "+JSON.stringify(data));
  res.write(JSON.stringify(data));
  res.end();
});


router.get('/data.html', function(req, res, next) {
  let f;
  f="<p><div>id:</div> "+"<input id='id' style='width: 80%;height: 5%;font-size: 100%;background-color: #F3F3F5';type='text' value='"+new Date().getTime()+"'></input>";
  f+= "<p>";
  if(appdef.showLocation) {
    f+="<div>location:</div> "+"<input id='location' style='width: 80%;height: 5%;font-size: 100%;background-color: #F3F3F5;' type='text' value=''></input>";
    f+= "<p>";
  }
  f+="<div>event_timestamp:</div> "+"<input id='timestamp' style='width: 80%;height: 5%;font-size: 100%;background-color: #F3F3F5;' type='text' value=''></input>";
  f+= "<p>";
  let sf='';
  console.log(JSON.stringify(fields));
  for(let i= 0; i< fields.length; i++) {
    if(fields[i] === "id" || fields[i] === "location" || fields[i] === "event_timestamp")
      continue;
      
   sf+= "json+= ', \""+fields[i]+"\":\"'+document.getElementById('"+fields[i]+"').value+'\"';";
   f+="<div>"+fields[i]+":</div> <input id='"+fields[i]+"' style='width: 80%;height: 5%;font-size: 100%;background-color: #F3F3F5;' type='text' value=''></input>";
   f+= "<p>";
  }
 
  res.render('data', { title: appdef.name, name: appdef.name, fields:f, showLocation: appdef.showLocation, getFields: sf});
});

router.post('/model', function(req, res, next) {
 let m = req.body;
 m= m.replace(/\"/g, '\'');
 //payloads= [ { topic: modeltopic, messages: m, partition: 0 } ];
  
  //console.log("Payload: "+JSON.stringify(payloads));
  
  //producer.send(payloads, function (err, data) {      
    //    console.log("Kafka payload sent: "+JSON.stringify(data)+" "+err);
  //});
  model= m;
  console.log("Model: "+model);
  res.end();
});

router.get('/model', function(req, res, next) {
  res.write(model);
  console.log(model);
  res.end();
});


router.get('/model.html', function(req, res, next) {
   res.render('model', { table: appdef.table, keyspace: appdef.keyspace, name:appdef.name});
  res.end();
});


function postHRData(jsonobj) {
  let color= "0x80FFFFFF";
 
  console.log("postHRData: "+ JSON.stringify(jsonobj));
  if(jsonobj.color== null || jsonobj.color == undefined)
    jsonobj.color= color;
  request.post(listener, {form:JSON.stringify(jsonobj)}, function(err, response, body) {
    if(err!= null)
    console.log(err);
  });
};

router.all('/data', function(req, res, next) {
 let msg= req.body;
 let url_parts = url.parse(req.url, true);
 let query = url_parts.query;
 
 if(! (query.json==undefined)) {
    msg= query.json;  
 }
 
 let jsonobj= JSON.parse(msg);
 jsonobj.model= model;
 let user= jsonobj.user;
 messages[user]= jsonobj;
 postToPMMLEvaluator(jsonobj, true);

res.end();
});

function postToPMMLEvaluator(jsonobj, posttolistener) {
  //console.log("post to pmml: "+JSON.stringify(jsonobj))
  request.post(modelevaluator, {form:JSON.stringify(jsonobj)}, function(err, response, body) {
    let color= "-1";
   
    if(err== null) {
       color= body;
     }
     else{
       console.log("Err evaluating model: "+err);
     }
    // console.log("Color: "+color);
     if(color==="-1")
       color="0x80FFFFFF";    
     if(color==="1")
       color="0x80FF0000";
     if(color==="0")
       color="0x8000FF00";
    //console.log("Color: "+color+" model: "+jsonobj.model);
     jsonobj.color= color;
    
     delete jsonobj.model;
     io.emit("hr", jsonobj);
     emitData();
     if(posttolistener)
      postHRData(jsonobj);
    });
};


function emitData() {
  let d= sessionData();
 // console.log("SessionData: "+d);
  io.emit("session", d);
};

function sessionData() {
  let ret = "{\"session\":{\"begincomment\":null,\"dayssince01012012\":0,\"dummy\":null,\"endcomment\":null,\"ended\":null,\"groupid\":{\"id\":1,\"name\":\"Default\"},\"id\":0,\"start\":0},\"users\":[";

  let data= new Array();
 
  let i= 0;
  let first= true;
  let now= new Date().getTime();
  
  for(var key in messages) {
  //  console.log(messages[key]);
    try {
    let dt= messages[key].event_timestamp;
    dt= dt.replace('T', ' ');
    dt = new Date(dt);
    let ms= dt.getTime();
    if(now> ms + 1000*60) {
      console.log("Deleting: "+key);
      delete messages[key];
     // messages.splice(messages.indexOf(key),1);
      console.log(messages);
      continue;
    }
    }
    catch(ex) {
      console.log(ex);
   } 
   
    let color= messages[key].color;
    let hr= messages[key].heartrate;
    let user= messages[key].user;
    let deviceid= messages[key].deviceid; 
    if (!first)
      ret+= ", ";
    else
      first = false;
    ret+= "{\"calories\":\"\",\"color\":\""+color+"\",\"hr\":\""+hr+"\",\"name\":\""+user+"\",\"recovery\":\"\",\"deviceid\":\""+deviceid+"\"}";
  }
  ret= ret+ "]}";

  let r= JSON.parse(ret);
  //console.log("users.length: "+ r.users.length);
  //res.write(ret);
  //res.end();
  //console.log(ret);
  return ret;
};




module.exports = router;


