FROM node:12.13.0-alpine
COPY . /opt/app
ENV APPDIR=/opt/app
ENV DOCKERHUB_USER=digitalemil
ENV DOCKERHUB_REPO=thegyminthecloud
ENTRYPOINT node /opt/app/bin/www
