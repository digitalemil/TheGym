export VALIDATOR="http://localhost:3034/validate"
export TRANSFORMER="http://localhost:3032/transform"
export KAFKA="10.0.1.4:9092"
export UI=http://localhost:3020/fromkafka
export APPDEF="{'name':'The Gym','showLocation':true,'fields':[{'name':'heartrate','pivot':true,'type':'Integer'},{'name':'user','pivot':false,'type':'String'},{'name':'deviceid','pivot':false,'type':'String'},{'name':'color','pivot':false,'type':'String'},{'name':'id','type':'Long','pivot':'false'},{'name':'location','type':'Location','pivot':'false'},{'name':'event_timestamp','type':'Date/time','pivot':'false'}],'transformer':'console.log(%22In%20%3A%20%22%2Brawtext)%3B%0Alet%20json%3D%20JSON.parse(rawtext)%3B%0Aresult%3D%20JSON.stringify(json)%3B%0Aconsole.log(%22After%20transformation%3A%20%22%2Bresult)%3B%0A%09%09%09%09%09%0A%09%09%09%09%09','topic':'hr','table':'hr','keyspace':'thegym','path':'thegym','creator':'http://localhost:3000'}"

#mvn package -DskipTests
java -Dssl.truststore-location=/mnt/mesos/sandbox/trust-ca.jks -jar target/uiupdater-2.0.0-SNAPSHOT.jar --server.port=8081


