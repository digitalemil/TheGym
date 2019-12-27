var express = require('express');
var router = express.Router();

const request = require('request');

let listener= process.env.LISTENER;

function fetchData() {

request('https://thegym-263112.appspot.com/data/fetch', (err, res, body) => {
  if (err) { return console.log(err); }
 // console.log(res);
  var j = JSON.parse(body);
  console.log("User: "+j.user+", "+j.hr+", "+j.lon+", "+j.lat);
  setTimeout(fetchData, 1000);
  if("---" == j.user)
    return;
//{"id":"1577451410468","location":"50.1109,8.68213","event_timestamp":"2019-12-27T12:57:00.59Z","heartrate":"188","user":"Me","deviceid":"41","color":"0x80FFFFFF"}
j.deviceid="85609";
j.color= "0x80FFFFFF";
j.heartrate= j.hr;
delete j.hr;
if(j.lon= "---")
    j.lon= "0";
if(j.lat= "---")
    j.lat= "0";
j.location= j.lon+","+j.lat;
delete j.lon;
delete j.lat;
let d= new Date(); 
let day= d.getUTCDate();
let daystring= ""+day;
			
  			if(day< 10)
    				daystring="0"+daystring;
  			let month= d.getUTCMonth()+1;
  			let monthstring= ""+month;
  			if(month< 10)
    				monthstring="0"+monthstring;
            		
		        let hour= d.getUTCHours();
			let hourstring= ""+hour;
  			if(hour< 10)
    				hourstring="0"+hourstring;
            		
			let minute= d.getUTCMinutes();
			let minutestring= ""+minute;
  			if(minute< 10)
    				minutestring="0"+minutestring;
            		    
			let second= d.getUTCMilliseconds()/1000.0;
			let secondstring= ""+second;
  			if(second< 10)
    				secondstring="0"+secondstring
			    
let time= d.getFullYear()+"-"+monthstring+"-"+daystring+"T"+hourstring+":"+minutestring+":"+secondstring+"Z";
j.event_timestamp= time;
console.log(j);
 request.post({
	headers: {'content-type' : 'application/json'},
	url:     listener,
	body:  JSON.stringify(j)
}, function(err, response, body) {
	if(err!=null) {
		console.log(err);
 }
});



});
};

setTimeout(fetchData, 500);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'The Gym Importer' });
});

module.exports = router;
