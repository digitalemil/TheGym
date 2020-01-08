#!/bin/bash

export DOCKERHUB_USER=digitalemil
export DOCKERHUB_REPO=thegyminthecloud
export VERSION=0.0.1
export BASEIMAGE=node:12.13.0-alpine
export APP_DIR=/opt/app


#JS/node: Generate dockerfile with docker hub info 
cat > Dockerfile  << EOF
FROM $BASEIMAGE
COPY . /opt/app
ENV APPDIR=/opt/app
ENV DOCKERHUB_USER=$DOCKERHUB_USER
ENV DOCKERHUB_REPO=$DOCKERHUB_REPO
ENTRYPOINT node /opt/app/bin/www
EOF

#cd KafkaConnectWithBigTable
#docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:kafka-connect-with-bigtable-v$VERSION .
#docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:kafka-connect-with-bigtable-v$VERSION
#cd ..

cd Microservice-PMMLEvaluator
mvn clean package -DskipTests
docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-pmmlevaluator-v$VERSION .
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-pmmlevaluator-v$VERSION 
cd ..


cp Dockerfile Microservice-UI		
cd Microservice-UI
docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-ui-v$VERSION .
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-ui-v$VERSION 
cd ..

cp Dockerfile Microservice-GAEImporter	
cd Microservice-GAEImporter
docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-gaeimporter-v$VERSION .
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-gaeimporter-v$VERSION 
cd ..

cp Dockerfile Microservice-ElasticSetup
cd Microservice-ElasticSetup
docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:elastic-setup-v$VERSION .
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:elastic-setup-v$VERSION
cd ..

cd Microservice-KafkaConnectSetup
docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:kafka-connect-setup-v$VERSION .
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:kafka-connect-setup-v$VERSION 
cd ..

cp Dockerfile Microservice-KafkaIngester
cd Microservice-KafkaIngester
docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-kafkaingester-v$VERSION .
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-kafkaingester-v$VERSION 
cd ..

cp Dockerfile Microservice-MessageTransformer
cd Microservice-MessageTransformer
docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-messagetransformer-v$VERSION .
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-messagetransformer-v$VERSION 
cd ..

cp Dockerfile Microservice-MessageValidator
cd Microservice-MessageValidator
docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-messagevalidator-v$VERSION .
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-messagevalidator-v$VERSION 
cd ..

cd Microservice-MessageListener
mvn package -DskipTests
docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-messagelistener-v$VERSION .
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-messagelistener-v$VERSION 
cd ..

cd Microservice-UIUpdater
mvn package -DskipTests
docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-uiupdater-v$VERSION .
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-uiupdater-v$VERSION 
cd ..

cp Dockerfile Microservice-UIVersion		
cd Microservice-UIVersion
docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-uiversion-v$VERSION-1.0.0 .
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-uiversion-v$VERSION-1.0.0
cd ..

cp Dockerfile Microservice-LoadGenerator	
cd Microservice-LoadGenerator
docker build -t $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-loadgenerator-v$VERSION .
docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:microservice-loadgenerator-v$VERSION 
cd ..


