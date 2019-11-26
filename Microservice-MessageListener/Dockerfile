FROM digitalemil/mypublicrepo:tomcat7
RUN rm -fr /opt/tomcat
COPY target/listener-2.0.0-SNAPSHOT.jar /opt/app.jar
RUN mkdir logs

#ENTRYPOINT /opt/java/bin/java -Dsasl.kerberos.service.name=kafka -Dsasl.jaas.config='com.sun.security.auth.module.Krb5LoginModule required useKeyTab=true storeKey=true keyTab="/mnt/mesos/sandbox/keytab" principal="client@MESOS.LAB"'  -Dsecurity.protocol=SASL_SSL -Djava.security.krb5.conf=/mnt/mesos/sandbox/krb5.conf -jar /opt/app.jar --server.port=$PORT0
ENTRYPOINT /opt/java/bin/java -Djava.security.krb5.conf=/mnt/mesos/sandbox/krb5.conf -jar /opt/app.jar --server.port=$PORT0 --server.address=0.0.0.0
