var express = require('express');
var router = express.Router();
var url= require('url');
var request = require('request');
var http = require("http");
var dash= require('../export.json');

let json= new String(process.env.APPDEF);
json= json.replace(/\'/g, '\"');

let appdef= JSON.parse(json);
appdef.path= "hr";

let fields= new Array(); 
let types= new Array();
let pivot= -1;

for(var i= 0; i< appdef.fields.length; i++) {
  fields[i] = appdef.fields[i].name;
  types[i] = appdef.fields[i].type;
  if(appdef.fields[i].pivot == true)
    pivot= i;
}

let elastic= process.env.ELASTIC_SERVICE;
let kibana= process.env.KIBANA_SERVICE;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Elastic Worker", appdef: JSON.stringify(appdef)
    });
});

//console.log("Skipping index creation. Done by kafka-connect. Pivot: "+pivot);


function putToElastic(index, json, type, id) {
  try {
    console.log("Put to elastic: "+elastic+"/"+index+"/"+type+"/"+id+"?pretty");
    let options= { 
                url: elastic+"/"+index+"/"+type+"/"+id+"?pretty",
                headers: {
                  'Content-Type': 'application/json'
                },
                body:JSON.stringify(json)
    };
    request.put(
      options, function(err, response, body) {
      if(err== null) {
        console.log(body);
      }
      else {
        console.log(err);
      }
    });
  }
  catch(ex) {
    console.log(ex);    
  }
};

let ni= 0;
// Create index  
try {
    let props= '{ "mappings": { "hr": { "properties": { "event_timestamp": { "type": "date" }, "location": { "type": "geo_point" } ';
    for(var i= 0; i< fields.length; i++) {
      if(fields[i]=== "id" || fields[i]=== "event_timestamp" || fields[i]=== "location")
        continue;
        if(appdef.fields[i].pivot==="true")
          pivot= i;
      let type= "integer";
      if(types[i]=== "Long")
        type= "long";
      if(types[i]=== "Double")
        type= "double";
      if(types[i]=== "Boolean")
        type= "boolean";
      if(types[i]=== "String")
        type= "keyword";
      if(types[i]=== "Date/time" || types[i]=== "Date/Time")
        type= "date";
      if(types[i]=== "Location")
        type= "geo_point";

      props+= ', "'+fields[i]+'": { "type": "'+type+'" }';
    }
    props+="}}}}";
    console.log("Elastic Index: "+props);
    createIndex(props);
    if(pivot> -1) {
      setTimeout(createIndexPattern, 1000);
    };
    
}
catch(ex) {
  console.log(ex);
}

function createIndex(props) {
  let options= { 
    url: elastic+"/"+appdef.path+"?pretty",
    body:props,
    headers: {
      'Content-Type': 'application/json'
    }
};
console.log("Create index: "+JSON.stringify(options))
console.log("Body: "+JSON.stringify(props))

request.put({ url: options.url, body: props, headers: options.headers }, function(err, response, body) {
      if(err== null) {
        console.log(body);
      }
      else {
        console.log(ni+" "+err);
      }
      if(response.statusCode == 404) {
        if(ni< 32) {
            ni++;
            setTimeout(createIndex(props), 100);
         }
      }
    });
};



function createIndexPattern() {
  let ip= '{ "attributes": {"title":"__INDEX","timeFieldName":"event_timestamp","fields":"[{\\"name\\":\\"_id\\",\\"type\\":\\"string\\",\\"count\\":0,\\"scripted\\":false,\\"indexed\\":false,\\"analyzed\\":false,\\"doc_values\\":false,\\"searchable\\":false,\\"aggregatable\\":false},{\\"name\\":\\"_type\\",\\"type\\":\\"string\\",\\"count\\":0,\\"scripted\\":false,\\"indexed\\":false,\\"analyzed\\":false,\\"doc_values\\":false,\\"searchable\\":true,\\"aggregatable\\":true},{\\"name\\":\\"_index\\",\\"type\\":\\"string\\",\\"count\\":0,\\"scripted\\":false,\\"indexed\\":false,\\"analyzed\\":false,\\"doc_values\\":false,\\"searchable\\":false,\\"aggregatable\\":false},{\\"name\\":\\"_score\\",\\"type\\":\\"number\\",\\"count\\":0,\\"scripted\\":false,\\"indexed\\":false,\\"analyzed\\":false,\\"doc_values\\":false,\\"searchable\\":false,\\"aggregatable\\":false},{\\"name\\":\\"_source\\",\\"type\\":\\"_source\\",\\"count\\":0,\\"scripted\\":false,\\"indexed\\":false,\\"analyzed\\":false,\\"doc_values\\":false,\\"searchable\\":false,\\"aggregatable\\":false},';
  console.log("Index pattern: "+ip);

for(i= 0; i< fields.length; i++) {
  let type= "number";
  if(fields[i]=== "id")
    continue;
      if(types[i]=== "Long")
        type= "number";
      if(types[i]=== "Double")
        type= "number";
      if(types[i]=== "Boolean")
        type= "boolean";
      if(types[i]=== "String")
        type= "string";
      if(types[i]=== "Date/time" || types[i]=== "Date/Time")
        type= "date";
      if(types[i]=== "Location")
        type= "geo_point";
  if(type=== "string") {
    ip+= '{\\"name\\":\\"'+fields[i]+'\\",\\"type\\":\\"'+type+'\\",\\"count\\":0,\\"scripted\\":false,\\"indexed\\":true,\\"analyzed\\":true,\\"doc_values\\":true,\\"searchable\\":true,\\"aggregatable\\":false},';
    ip+= '{\\"name\\":\\"'+fields[i]+'.keyword\\",\\"type\\":\\"'+type+'\\",\\"count\\":0,\\"scripted\\":false,\\"indexed\\":true,\\"analyzed\\":false,\\"doc_values\\":true,\\"searchable\\":true,\\"aggregatable\\":true}'; 
 }
  else {
    ip+= '{\\"name\\":\\"'+fields[i]+'\\",\\"type\\":\\"'+type+'\\",\\"count\\":0,\\"scripted\\":false,\\"indexed\\":true,\\"analyzed\\":false,\\"doc_values\\":true,\\"searchable\\":true,\\"aggregatable\\":true}';
  }
  if(i< fields.length-1)
  ip+= ",";
}
ip+= ']"}}';
ip= ip.replace(/__INDEX/g, appdef.path);
console.log("Creating index-pattern: "+ip);
 try {
  // putToElastic(".kibana", "", "index-pattern", "hr");
  // console.log("Put to elastic: "+elastic+"/"+index+"/"+type+"/"+id+"?pretty");
  // console.log(elastic+"/"+".kibana"+"/"+"index-pattern"+"/"+appdef.path+"?pretty");
   let options= { 
    url: kibana+"/api/saved_objects/index-pattern/"+appdef.path,
    headers: {
      'Content-Type': 'application/json',
      'kbn-xsrf': 'true'
    },
    body:ip
  };
  console.log("url: "+options.url);
  request.post(options, function(err, response, body) {
      if(err!= null) {
        console.log(err);
      }
      else {
        console.log(body);
      setTimeout(createDashboard, 1000);
     }
    });
  }
  catch(ex) {
    console.log(ex);    
  }
}

function createDashboard() {
  /*
let v1= JSON.stringify(vis[0]);
v1= v1.replace(/PIVOTFIELD/g, fields[pivot]);
v1= v1.replace(/__INDEX/g, appdef.path);
console.log("v1: "+v1);

let v2= JSON.stringify(vis[1]);
v2= v2.replace(/PIVOTFIELD/g, fields[pivot]);
v2= v2.replace(/__INDEX/g, appdef.path);
console.log("v2: "+v2);

let v3= JSON.stringify(vis[2]);
v3= v3.replace(/PIVOTFIELD/g, fields[pivot]);
v3= v3.replace(/__INDEX/g, appdef.path);
console.log("v3: "+v3);

let v4= JSON.stringify(vis[3]);
v4= v4.replace(/PIVOTFIELD/g, fields[pivot]);
v4= v4.replace(/__INDEX/g, appdef.path);
console.log("v4: "+v4);

let d1= JSON.stringify(dash[0]);
d1= d1.replace(/AppDashboard/g, appdef.name);
console.log("d1: "+d1);
*/
//http://localhost:5601/api/saved_objects/dashboard/d2acece0-f186-11e8-ae00-6d467c37380e?overwrite=true

try {
  console.log("Post to Kibana: "+kibana+"/api/kibana/dashboards/import");
  console.log("dash: "+dash);
  let options= { 
              url: kibana+"/api/kibana/dashboards/import",
              headers: {
                'Content-Type': 'application/json',
                'kbn-xsrf': 'true'
              },
              json:JSON.stringify(dash)
  };
  request.post(
    options, function(err, response, body) {
    if(err== null) {
      console.log(body);
    }
    else {
      console.log(err);
    }
    process.exit();
  });
}
catch(ex) {
  console.log(ex);    
}

/*
putToElastic(".kibana",JSON.parse(v1), "visualization", "v1");
putToElastic(".kibana",JSON.parse(v2), "visualization", "v2");
putToElastic(".kibana",JSON.parse(v3), "visualization", "v3");
putToElastic(".kibana",JSON.parse(v4), "visualization", "v4");
putToElastic(".kibana",JSON.parse(d1), "dashboard", "d1");*/
setTimeout(flushIndex, 500);
};

function flushIndex() {
   try {
   request.post(elastic+"/"+".kibana"+"/_flush?wait_if_ongoing", function(err, response, body) {
      if(err!= null) {
        console.log(err);
      }
      else {
        console.log(body);
     }
    });
  }
  catch(ex) {
    console.log(ex);    
  }
};

router.post('/data', function(req, res, next) {
  console.log(req.body);
  console.log("Doing nothing, now relying on kafka connect.");
  /*
  let json= JSON.parse(req.body);
  let t= json.event_timestamp;
  let ms= new Date(t.toString().trim()).getTime();
  json.event_timestamp= ms;
  console.log("ms: "+ms);
  console.log("json: "+JSON.stringify(json));
  let id= json.id;
  delete json.id;
  putToElastic(appdef.path, json, "external", id);
  */
  res.statusCode= 200;
  res.end();
});

module.exports = router;

/*
{"attributes": {"title": "hr","timeFieldName": "event_timestamp",
		"notExpandable": true,
		"fields": "[{\"name\":\"_id\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":false,\"aggregatable\":false},{\"name\":\"_type\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":true,\"aggregatable\":true},{\"name\":\"_index\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":false,\"aggregatable\":false},{\"name\":\"_score\",\"type\":\"number\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":false,\"aggregatable\":false},{\"name\":\"_source\",\"type\":\"_source\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":false,\"aggregatable\":false},{\"name\":\"heartrate\",\"type\":\"number\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true,\"searchable\":true,\"aggregatable\":true},{\"name\":\"user\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":true,\"searchable\":true,\"aggregatable\":false},{\"name\":\"user.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true,\"searchable\":true,\"aggregatable\":true},{\"name\":\"deviceid\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":true,\"searchable\":true,\"aggregatable\":false},{\"name\":\"deviceid.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true,\"searchable\":true,\"aggregatable\":true},{\"name\":\"color\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":true,\"searchable\":true,\"aggregatable\":false},{\"name\":\"color.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true,\"searchable\":true,\"aggregatable\":true},{\"name\":\"location\",\"type\":\"geo_point\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true,\"searchable\":true,\"aggregatable\":true},{\"name\":\"event_timestamp\",\"type\":\"date\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true,\"searchable\":true,\"aggregatable\":true}]",
		"fieldFormatMap": "{\"flow.dst_port\":{\"id\":\"number\",\"params\":{\"pattern\":\"0\"}},\"flow.src_port\":{\"id\":\"number\",\"params\":{\"pattern\":\"0\"}},\"flow.bytes\":{\"id\":\"bytes\"}}"
	}
}
Index pattern: { "attributes": {"title":"__INDEX","timeFieldName":"event_timestamp","fields":"[{\"name\":\"_id\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":false,\"aggregatable\":false},{\"name\":\"_type\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":true,\"aggregatable\":true},{\"name\":\"_index\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":false,\"aggregatable\":false},{\"name\":\"_score\",\"type\":\"number\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":false,\"aggregatable\":false},{\"name\":\"_source\",\"type\":\"_source\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":false,\"aggregatable\":false},

{"title":"__INDEX","type":"index-pattern","timeFieldName":"event_timestamp","fields":"[{\"name\":\"_id\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":false,\"aggregatable\":false},{\"name\":\"_type\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":true,\"aggregatable\":true},{\"name\":\"_index\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":false,\"aggregatable\":false},{\"name\":\"_score\",\"type\":\"number\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":false,\"aggregatable\":false},{\"name\":\"_source\",\"type\":\"_source\",\"count\":0,\"scripted\":false,\"indexed\":false,\"analyzed\":false,\"doc_values\":false,\"searchable\":false,\"aggregatable\":false},

{
  "mappings": {
    "doc": {
      "properties": {
        "deviceid": { "type": "keyword" }, 
        "name": { "type": "text" },
        "hr": { "type": "number" },
        "location": { "type": "geo_point" },
        "event_timestamp": { "type": "date" }
      }
    }
  }
}



*/