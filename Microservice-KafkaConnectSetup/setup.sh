#!/bin/bash

echo Kafka Connect: $CONNECTURL

ELASTICSEARCHSINK=$(echo "$ELASTICSEARCHSINK" | sed -e "s@'@\"@g;")
echo Elastic: $ELASTICSEARCHSINK

#CASSANDRASINK=$(echo "$CASSANDRASINK" | sed -e "s@'@\"@g;")
#echo Cassandra: "$CASSANDRASINK"

#HDFSSINK=$(echo "$HDFSSINK" | sed -e "s@'@\"@g;")
#echo HDFS: $HDFSSINK


sleep 5

until $(curl --output /dev/null --silent --head --fail $CONNECTURL/connectors); do
    printf '.'
    sleep 5
done
curl -XGET $CONNECTURL/connectors

curl -X DELETE $CONNECTURL/connectors/elasticsearch-sink

sleep 2

curl -XPOST -H "Content-Type: application/json" -d "$ELASTICSEARCHSINK" $CONNECTURL/connectors

sleep 2

#curl -XPOST -H "Content-Type: application/json" -d "$CASSANDRASINK" $CONNECTURL/connectors
#sleep 1

#curl -XPOST -H "Content-Type: application/json" -d "$HDFSSINK" $CONNECTURL/connectors
#sleep 1

curl -XGET $CONNECTURL/connectors

