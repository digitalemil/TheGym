export CASSANDRA_SERVICE=localhost:9042
export KAFKA_SERVICE="localhost:2181"
export LISTENER="http://localhost:3030/data"
export MODELEVALUATOR="http://localhost:8080"
export MESOS_SANDBOX=.
export JUPYTER_TOKEN='6624633ecc7667de4a20908cffe71f74319b32a1ed5d357f'
export NOTEBOOK_URL=http://localhost:8888?token=$JUPYTER_TOKEN
export APPDIR=Users/emil/Dropbox/Mesosphere/projects/private/TheGym/UI
export APPDEF="{'name':'The Gym','showLocation':true,'fields':[{'name':'heartrate','pivot':true,'type':'Integer'},{'name':'user','pivot':false,'type':'String'},{'name':'deviceid','pivot':false,'type':'String'},{'name':'color','pivot':false,'type':'String'},{'name':'id','type':'Long','pivot':'false'},{'name':'location','type':'Location','pivot':'false'},{'name':'event_timestamp','type':'Date/time','pivot':'false'}],'transformer':'console.log(%22In%20%3A%20%22%2Brawtext)%3B%0Alet%20json%3D%20JSON.parse(rawtext)%3B%0Aresult%3D%20JSON.stringify(json)%3B%0Aconsole.log(%22After%20transformation%3A%20%22%2Bresult)%3B%0A%09%09%09%09%09%0A%09%09%09%09%09','topic':'hr','table':'hr','keyspace':'thegym','path':'thegym','creator':'http://localhost:3000'}"
export PORT=8081
nodemon npm start


