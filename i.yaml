apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  name: ui
spec:
  replicas: 1
  selector:
    matchLabels:
      app: thegym
      component: ui
      version: 0.0.1
  strategy: {}
  template:
    metadata:
      annotations:
        sidecar.istio.io/status: '{"version":"249fe8117967ad89e644f4ee6f775cd76fc32e399ad4faecc9541b9277053d85","initContainers":["istio-init"],"containers":["istio-proxy"],"volumes":["istio-envoy","istio-certs"],"imagePullSecrets":null}'
      creationTimestamp: null
      labels:
        app: thegym
        component: ui
        security.istio.io/tlsMode: istio
        version: 0.0.1
      name: ui
    spec:
      containers:
      - env:
        - name: PORT
          value: "80"
        - name: APPDEF
          value: '{''name'':''The Gym'',''showLocation'':''true'',''fields'':[{''name'':''heartrate'',''pivot'':''true'',''type'':''Integer''},{''name'':''user'',''pivot'':false,''type'':''String''},{''name'':''deviceid'',''pivot'':false,''type'':''String''},{''name'':''color'',''pivot'':false,''type'':''String''},{''name'':''id'',''pivot'':''false'',''type'':''Long''},{''name'':''location'',''pivot'':''false'',''type'':''Location''},{''name'':''event_timestamp'',''pivot'':''false'',''type'':''Date/time''}],''transformer'':''%0A%09result%3D%20rawtext%3B%0A%09%09%09%09%09%0A%09%09%09%09%09'',''topic'':''hr'',''table'':''hr'',''keyspace'':''thegym'',''path'':''thegym'',''creator'':'''',''dockerrepo'':'''',''img'':'''',''vis'':'''',''dash'':'''',''hideloader'':''true''}'
        - name: LISTENER
          value: http://messagelistener/data
        - name: UIVERSION
          value: http://uiversion
        - name: MODELEVALUATOR
          value: http://pmmlevaluator
        - name: UIVERSION
          value: http://uiversion
        - name: APPDIR
          value: /opt/app
        - name: DASHBOARDURL
          value: /app/kibana#/dashboard/d2?embed=true?_g=(refreshInterval:(display:'60+seconds',pause:!f,section:1,value:10000),time:(from:now-60m,mode:quick,to:now)),viewMode:view)
        image: digitalemil/thegyminthecloud:microservice-ui-v0.0.1
        imagePullPolicy: Always
        name: ui
        ports:
        - containerPort: 80
        resources: {}
      - env:
        - name: ENDPOINT_WEB2
          value: "8080"
        - name: spring_profiles_active
          value: nonsecure
        - name: APPDEF
          value: '{''name'':''The Gym'',''showLocation'':''true'',''fields'':[{''name'':''heartrate'',''pivot'':''true'',''type'':''Integer''},{''name'':''user'',''pivot'':false,''type'':''String''},{''name'':''deviceid'',''pivot'':false,''type'':''String''},{''name'':''color'',''pivot'':false,''type'':''String''},{''name'':''id'',''pivot'':''false'',''type'':''Long''},{''name'':''location'',''pivot'':''false'',''type'':''Location''},{''name'':''event_timestamp'',''pivot'':''false'',''type'':''Date/time''}],''transformer'':''%0A%09result%3D%20rawtext%3B%0A%09%09%09%09%09%0A%09%09%09%09%09'',''topic'':''hr'',''table'':''hr'',''keyspace'':''thegym'',''path'':''thegym'',''creator'':'''',''dockerrepo'':'''',''img'':'''',''vis'':'''',''dash'':'''',''hideloader'':''true''}'
        - name: LISTENER
          value: http://messagelistener/data
        - name: KAFKA
          value: kafka-instance-svc:9092
        - name: UISERVICE
          value: http://uiservice
        - name: APPDIR
          value: /opt/app
        - name: DASHBOARDURL
          value: /app/kibana
        image: digitalemil/thegyminthecloud:microservice-uiupdater-v0.0.1
        imagePullPolicy: Always
        name: uiupdater
        resources: {}
      - args:
        - proxy
        - sidecar
        - --domain
        - $(POD_NAMESPACE).svc.cluster.local
        - --configPath
        - /etc/istio/proxy
        - --binaryPath
        - /usr/local/bin/envoy
        - --serviceCluster
        - thegym.$(POD_NAMESPACE)
        - --drainDuration
        - 45s
        - --parentShutdownDuration
        - 1m0s
        - --discoveryAddress
        - istio-pilot.istio-system:15011
        - --zipkinAddress
        - zipkin.istio-system:9411
        - --dnsRefreshRate
        - 300s
        - --connectTimeout
        - 10s
        - --proxyAdminPort
        - "15000"
        - --concurrency
        - "2"
        - --controlPlaneAuthPolicy
        - MUTUAL_TLS
        - --statusPort
        - "15020"
        - --applicationPorts
        - "80"
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: INSTANCE_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        - name: ISTIO_META_POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: ISTIO_META_CONFIG_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: ISTIO_META_INTERCEPTION_MODE
          value: REDIRECT
        - name: ISTIO_META_INCLUDE_INBOUND_PORTS
          value: "80"
        - name: ISTIO_METAJSON_LABELS
          value: |
            {"app":"thegym","component":"ui","version":"0.0.1"}
        image: gke.gcr.io/istio/proxyv2:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        lifecycle:
          preStop:
            exec:
              command:
              - sh
              - -c
              - sleep 20; while [ $(netstat -plunt | grep tcp | grep -v envoy | wc
                -l | xargs) -ne 0 ]; do sleep 1; done
        name: istio-proxy
        ports:
        - containerPort: 15090
          name: http-envoy-prom
          protocol: TCP
        readinessProbe:
          failureThreshold: 30
          httpGet:
            path: /healthz/ready
            port: 15020
          initialDelaySeconds: 1
          periodSeconds: 2
        resources:
          limits:
            cpu: "2"
            memory: 1Gi
          requests:
            cpu: 100m
            memory: 128Mi
        securityContext:
          readOnlyRootFilesystem: true
          runAsUser: 1337
        volumeMounts:
        - mountPath: /etc/istio/proxy
          name: istio-envoy
        - mountPath: /etc/certs/
          name: istio-certs
          readOnly: true
      initContainers:
      - args:
        - -p
        - "15001"
        - -u
        - "1337"
        - -m
        - REDIRECT
        - -i
        - '*'
        - -x
        - ""
        - -b
        - "80"
        - -d
        - "15020"
        image: gke.gcr.io/istio/proxy_init:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        name: istio-init
        resources:
          limits:
            cpu: 100m
            memory: 50Mi
          requests:
            cpu: 10m
            memory: 10Mi
        securityContext:
          capabilities:
            add:
            - NET_ADMIN
          runAsNonRoot: false
          runAsUser: 0
      volumes:
      - emptyDir:
          medium: Memory
        name: istio-envoy
      - name: istio-certs
        secret:
          optional: true
          secretName: istio.default
status: {}
---
kind: Service
apiVersion: v1
metadata:
  name: ui
spec:
  selector:
    app: thegym
    component: ui
    version: 0.0.1  
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
---
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  name: messagetransformer
spec:
  replicas: 1
  selector:
    matchLabels:
      app: thegym
      component: messagetransformer
      version: 0.0.1
  strategy: {}
  template:
    metadata:
      annotations:
        sidecar.istio.io/status: '{"version":"249fe8117967ad89e644f4ee6f775cd76fc32e399ad4faecc9541b9277053d85","initContainers":["istio-init"],"containers":["istio-proxy"],"volumes":["istio-envoy","istio-certs"],"imagePullSecrets":null}'
      creationTimestamp: null
      labels:
        app: thegym
        component: messagetransformer
        security.istio.io/tlsMode: istio
        version: 0.0.1
      name: messagetransformer
    spec:
      containers:
      - env:
        - name: APPDEF
          value: '{''name'':''The Gym'',''showLocation'':''true'',''fields'':[{''name'':''heartrate'',''pivot'':''true'',''type'':''Integer''},{''name'':''user'',''pivot'':false,''type'':''String''},{''name'':''deviceid'',''pivot'':false,''type'':''String''},{''name'':''color'',''pivot'':false,''type'':''String''},{''name'':''id'',''pivot'':''false'',''type'':''Long''},{''name'':''location'',''pivot'':''false'',''type'':''Location''},{''name'':''event_timestamp'',''pivot'':''false'',''type'':''Date/time''}],''transformer'':''%0A%09result%3D%20rawtext%3B%0A%09%09%09%09%09%0A%09%09%09%09%09'',''topic'':''hr'',''table'':''hr'',''keyspace'':''thegym'',''path'':''thegym'',''creator'':'''',''dockerrepo'':'''',''img'':'''',''vis'':'''',''dash'':'''',''hideloader'':''true''}'
        image: digitalemil/thegyminthecloud:microservice-messagetransformer-v0.0.1
        imagePullPolicy: Always
        name: messagetransformer
        ports:
        - containerPort: 3032
        resources: {}
      - args:
        - proxy
        - sidecar
        - --domain
        - $(POD_NAMESPACE).svc.cluster.local
        - --configPath
        - /etc/istio/proxy
        - --binaryPath
        - /usr/local/bin/envoy
        - --serviceCluster
        - thegym.$(POD_NAMESPACE)
        - --drainDuration
        - 45s
        - --parentShutdownDuration
        - 1m0s
        - --discoveryAddress
        - istio-pilot.istio-system:15011
        - --zipkinAddress
        - zipkin.istio-system:9411
        - --dnsRefreshRate
        - 300s
        - --connectTimeout
        - 10s
        - --proxyAdminPort
        - "15000"
        - --concurrency
        - "2"
        - --controlPlaneAuthPolicy
        - MUTUAL_TLS
        - --statusPort
        - "15020"
        - --applicationPorts
        - "3032"
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: INSTANCE_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        - name: ISTIO_META_POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: ISTIO_META_CONFIG_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: ISTIO_META_INTERCEPTION_MODE
          value: REDIRECT
        - name: ISTIO_META_INCLUDE_INBOUND_PORTS
          value: "3032"
        - name: ISTIO_METAJSON_LABELS
          value: |
            {"app":"thegym","component":"messagetransformer","version":"0.0.1"}
        image: gke.gcr.io/istio/proxyv2:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        lifecycle:
          preStop:
            exec:
              command:
              - sh
              - -c
              - sleep 20; while [ $(netstat -plunt | grep tcp | grep -v envoy | wc
                -l | xargs) -ne 0 ]; do sleep 1; done
        name: istio-proxy
        ports:
        - containerPort: 15090
          name: http-envoy-prom
          protocol: TCP
        readinessProbe:
          failureThreshold: 30
          httpGet:
            path: /healthz/ready
            port: 15020
          initialDelaySeconds: 1
          periodSeconds: 2
        resources:
          limits:
            cpu: "2"
            memory: 1Gi
          requests:
            cpu: 100m
            memory: 128Mi
        securityContext:
          readOnlyRootFilesystem: true
          runAsUser: 1337
        volumeMounts:
        - mountPath: /etc/istio/proxy
          name: istio-envoy
        - mountPath: /etc/certs/
          name: istio-certs
          readOnly: true
      initContainers:
      - args:
        - -p
        - "15001"
        - -u
        - "1337"
        - -m
        - REDIRECT
        - -i
        - '*'
        - -x
        - ""
        - -b
        - "3032"
        - -d
        - "15020"
        image: gke.gcr.io/istio/proxy_init:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        name: istio-init
        resources:
          limits:
            cpu: 100m
            memory: 50Mi
          requests:
            cpu: 10m
            memory: 10Mi
        securityContext:
          capabilities:
            add:
            - NET_ADMIN
          runAsNonRoot: false
          runAsUser: 0
      volumes:
      - emptyDir:
          medium: Memory
        name: istio-envoy
      - name: istio-certs
        secret:
          optional: true
          secretName: istio.default
status: {}
---
kind: Service
apiVersion: v1
metadata:
  name: messagetransformer
spec:
  selector:
    app: thegym
    component: messagetransformer
    version: 0.0.1    
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3032
---
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  name: messagevalidator
spec:
  replicas: 1
  selector:
    matchLabels:
      app: thegym
      component: messagevalidator
      version: 0.0.1
  strategy: {}
  template:
    metadata:
      annotations:
        sidecar.istio.io/status: '{"version":"249fe8117967ad89e644f4ee6f775cd76fc32e399ad4faecc9541b9277053d85","initContainers":["istio-init"],"containers":["istio-proxy"],"volumes":["istio-envoy","istio-certs"],"imagePullSecrets":null}'
      creationTimestamp: null
      labels:
        app: thegym
        component: messagevalidator
        security.istio.io/tlsMode: istio
        version: 0.0.1
      name: messagevalidator
    spec:
      containers:
      - env:
        - name: APPDEF
          value: '{''name'':''The Gym'',''showLocation'':''true'',''fields'':[{''name'':''heartrate'',''pivot'':''true'',''type'':''Integer''},{''name'':''user'',''pivot'':false,''type'':''String''},{''name'':''deviceid'',''pivot'':false,''type'':''String''},{''name'':''color'',''pivot'':false,''type'':''String''},{''name'':''id'',''pivot'':''false'',''type'':''Long''},{''name'':''location'',''pivot'':''false'',''type'':''Location''},{''name'':''event_timestamp'',''pivot'':''false'',''type'':''Date/time''}],''transformer'':''%0A%09result%3D%20rawtext%3B%0A%09%09%09%09%09%0A%09%09%09%09%09'',''topic'':''hr'',''table'':''hr'',''keyspace'':''thegym'',''path'':''thegym'',''creator'':'''',''dockerrepo'':'''',''img'':'''',''vis'':'''',''dash'':'''',''hideloader'':''true''}'
        image: digitalemil/thegyminthecloud:microservice-messagevalidator-v0.0.1
        imagePullPolicy: Always
        name: messagevalidator
        ports:
        - containerPort: 3034
        resources: {}
      - args:
        - proxy
        - sidecar
        - --domain
        - $(POD_NAMESPACE).svc.cluster.local
        - --configPath
        - /etc/istio/proxy
        - --binaryPath
        - /usr/local/bin/envoy
        - --serviceCluster
        - thegym.$(POD_NAMESPACE)
        - --drainDuration
        - 45s
        - --parentShutdownDuration
        - 1m0s
        - --discoveryAddress
        - istio-pilot.istio-system:15011
        - --zipkinAddress
        - zipkin.istio-system:9411
        - --dnsRefreshRate
        - 300s
        - --connectTimeout
        - 10s
        - --proxyAdminPort
        - "15000"
        - --concurrency
        - "2"
        - --controlPlaneAuthPolicy
        - MUTUAL_TLS
        - --statusPort
        - "15020"
        - --applicationPorts
        - "3034"
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: INSTANCE_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        - name: ISTIO_META_POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: ISTIO_META_CONFIG_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: ISTIO_META_INTERCEPTION_MODE
          value: REDIRECT
        - name: ISTIO_META_INCLUDE_INBOUND_PORTS
          value: "3034"
        - name: ISTIO_METAJSON_LABELS
          value: |
            {"app":"thegym","component":"messagevalidator","version":"0.0.1"}
        image: gke.gcr.io/istio/proxyv2:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        lifecycle:
          preStop:
            exec:
              command:
              - sh
              - -c
              - sleep 20; while [ $(netstat -plunt | grep tcp | grep -v envoy | wc
                -l | xargs) -ne 0 ]; do sleep 1; done
        name: istio-proxy
        ports:
        - containerPort: 15090
          name: http-envoy-prom
          protocol: TCP
        readinessProbe:
          failureThreshold: 30
          httpGet:
            path: /healthz/ready
            port: 15020
          initialDelaySeconds: 1
          periodSeconds: 2
        resources:
          limits:
            cpu: "2"
            memory: 1Gi
          requests:
            cpu: 100m
            memory: 128Mi
        securityContext:
          readOnlyRootFilesystem: true
          runAsUser: 1337
        volumeMounts:
        - mountPath: /etc/istio/proxy
          name: istio-envoy
        - mountPath: /etc/certs/
          name: istio-certs
          readOnly: true
      initContainers:
      - args:
        - -p
        - "15001"
        - -u
        - "1337"
        - -m
        - REDIRECT
        - -i
        - '*'
        - -x
        - ""
        - -b
        - "3034"
        - -d
        - "15020"
        image: gke.gcr.io/istio/proxy_init:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        name: istio-init
        resources:
          limits:
            cpu: 100m
            memory: 50Mi
          requests:
            cpu: 10m
            memory: 10Mi
        securityContext:
          capabilities:
            add:
            - NET_ADMIN
          runAsNonRoot: false
          runAsUser: 0
      volumes:
      - emptyDir:
          medium: Memory
        name: istio-envoy
      - name: istio-certs
        secret:
          optional: true
          secretName: istio.default
status: {}
---
kind: Service
apiVersion: v1
metadata:
  name: messagevalidator
spec:
  selector:
    app: thegym
    component: messagevalidator
    version: 0.0.1    
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3034
---
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  name: messagelistener
spec:
  replicas: 1
  selector:
    matchLabels:
      app: thegym
      component: messagelistener
      version: 0.0.1
  strategy: {}
  template:
    metadata:
      annotations:
        sidecar.istio.io/status: '{"version":"249fe8117967ad89e644f4ee6f775cd76fc32e399ad4faecc9541b9277053d85","initContainers":["istio-init"],"containers":["istio-proxy"],"volumes":["istio-envoy","istio-certs"],"imagePullSecrets":null}'
      creationTimestamp: null
      labels:
        app: thegym
        component: messagelistener
        security.istio.io/tlsMode: istio
        version: 0.0.1
      name: messagelistener
    spec:
      containers:
      - env:
        - name: APPDEF
          value: '{''name'':''The Gym'',''showLocation'':''true'',''fields'':[{''name'':''heartrate'',''pivot'':''true'',''type'':''Integer''},{''name'':''user'',''pivot'':false,''type'':''String''},{''name'':''deviceid'',''pivot'':false,''type'':''String''},{''name'':''color'',''pivot'':false,''type'':''String''},{''name'':''id'',''pivot'':''false'',''type'':''Long''},{''name'':''location'',''pivot'':''false'',''type'':''Location''},{''name'':''event_timestamp'',''pivot'':''false'',''type'':''Date/time''}],''transformer'':''%0A%09result%3D%20rawtext%3B%0A%09%09%09%09%09%0A%09%09%09%09%09'',''topic'':''hr'',''table'':''hr'',''keyspace'':''thegym'',''path'':''thegym'',''creator'':'''',''dockerrepo'':'''',''img'':'''',''vis'':'''',''dash'':'''',''hideloader'':''true''}'
        - name: TRANSFORMER
          value: http://messagetransformer/transform
        - name: VALIDATOR
          value: http://messagevalidator/validate
        - name: KAFKA
          value: kafka-instance-svc:9092
        - name: PORT0
          value: "3030"
        image: digitalemil/thegyminthecloud:microservice-messagelistener-v0.0.1
        imagePullPolicy: Always
        name: messagelistener
        ports:
        - containerPort: 3030
        resources: {}
      - args:
        - proxy
        - sidecar
        - --domain
        - $(POD_NAMESPACE).svc.cluster.local
        - --configPath
        - /etc/istio/proxy
        - --binaryPath
        - /usr/local/bin/envoy
        - --serviceCluster
        - thegym.$(POD_NAMESPACE)
        - --drainDuration
        - 45s
        - --parentShutdownDuration
        - 1m0s
        - --discoveryAddress
        - istio-pilot.istio-system:15011
        - --zipkinAddress
        - zipkin.istio-system:9411
        - --dnsRefreshRate
        - 300s
        - --connectTimeout
        - 10s
        - --proxyAdminPort
        - "15000"
        - --concurrency
        - "2"
        - --controlPlaneAuthPolicy
        - MUTUAL_TLS
        - --statusPort
        - "15020"
        - --applicationPorts
        - "3030"
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: INSTANCE_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        - name: ISTIO_META_POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: ISTIO_META_CONFIG_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: ISTIO_META_INTERCEPTION_MODE
          value: REDIRECT
        - name: ISTIO_META_INCLUDE_INBOUND_PORTS
          value: "3030"
        - name: ISTIO_METAJSON_LABELS
          value: |
            {"app":"thegym","component":"messagelistener","version":"0.0.1"}
        image: gke.gcr.io/istio/proxyv2:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        lifecycle:
          preStop:
            exec:
              command:
              - sh
              - -c
              - sleep 20; while [ $(netstat -plunt | grep tcp | grep -v envoy | wc
                -l | xargs) -ne 0 ]; do sleep 1; done
        name: istio-proxy
        ports:
        - containerPort: 15090
          name: http-envoy-prom
          protocol: TCP
        readinessProbe:
          failureThreshold: 30
          httpGet:
            path: /healthz/ready
            port: 15020
          initialDelaySeconds: 1
          periodSeconds: 2
        resources:
          limits:
            cpu: "2"
            memory: 1Gi
          requests:
            cpu: 100m
            memory: 128Mi
        securityContext:
          readOnlyRootFilesystem: true
          runAsUser: 1337
        volumeMounts:
        - mountPath: /etc/istio/proxy
          name: istio-envoy
        - mountPath: /etc/certs/
          name: istio-certs
          readOnly: true
      initContainers:
      - args:
        - -p
        - "15001"
        - -u
        - "1337"
        - -m
        - REDIRECT
        - -i
        - '*'
        - -x
        - ""
        - -b
        - "3030"
        - -d
        - "15020"
        image: gke.gcr.io/istio/proxy_init:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        name: istio-init
        resources:
          limits:
            cpu: 100m
            memory: 50Mi
          requests:
            cpu: 10m
            memory: 10Mi
        securityContext:
          capabilities:
            add:
            - NET_ADMIN
          runAsNonRoot: false
          runAsUser: 0
      volumes:
      - emptyDir:
          medium: Memory
        name: istio-envoy
      - name: istio-certs
        secret:
          optional: true
          secretName: istio.default
status: {}
---
kind: Service
apiVersion: v1
metadata:
  name: messagelistener
spec:
  selector:
    app: thegym
    component: messagelistener
    version: 0.0.1    
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3030
---
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  name: pmmlevaluator
spec:
  replicas: 1
  selector:
    matchLabels:
      app: thegym
      component: pmmlevaluator
      version: 0.0.1
  strategy: {}
  template:
    metadata:
      annotations:
        sidecar.istio.io/status: '{"version":"249fe8117967ad89e644f4ee6f775cd76fc32e399ad4faecc9541b9277053d85","initContainers":["istio-init"],"containers":["istio-proxy"],"volumes":["istio-envoy","istio-certs"],"imagePullSecrets":null}'
      creationTimestamp: null
      labels:
        app: thegym
        component: pmmlevaluator
        security.istio.io/tlsMode: istio
        version: 0.0.1
      name: loader
    spec:
      containers:
      - env:
        - name: APPDEF
          value: '{''name'':''The Gym'',''showLocation'':''true'',''fields'':[{''name'':''heartrate'',''pivot'':''true'',''type'':''Integer''},{''name'':''user'',''pivot'':false,''type'':''String''},{''name'':''deviceid'',''pivot'':false,''type'':''String''},{''name'':''color'',''pivot'':false,''type'':''String''},{''name'':''id'',''pivot'':''false'',''type'':''Long''},{''name'':''location'',''pivot'':''false'',''type'':''Location''},{''name'':''event_timestamp'',''pivot'':''false'',''type'':''Date/time''}],''transformer'':''%0A%09result%3D%20rawtext%3B%0A%09%09%09%09%09%0A%09%09%09%09%09'',''topic'':''hr'',''table'':''hr'',''keyspace'':''thegym'',''path'':''thegym'',''creator'':'''',''dockerrepo'':'''',''img'':'''',''vis'':'''',''dash'':'''',''hideloader'':''true''}'
        image: digitalemil/thegyminthecloud:microservice-pmmlevaluator-v0.0.1
        imagePullPolicy: Always
        name: pmmlevaluator
        ports:
        - containerPort: 8080
        resources: {}
      - args:
        - proxy
        - sidecar
        - --domain
        - $(POD_NAMESPACE).svc.cluster.local
        - --configPath
        - /etc/istio/proxy
        - --binaryPath
        - /usr/local/bin/envoy
        - --serviceCluster
        - thegym.$(POD_NAMESPACE)
        - --drainDuration
        - 45s
        - --parentShutdownDuration
        - 1m0s
        - --discoveryAddress
        - istio-pilot.istio-system:15011
        - --zipkinAddress
        - zipkin.istio-system:9411
        - --dnsRefreshRate
        - 300s
        - --connectTimeout
        - 10s
        - --proxyAdminPort
        - "15000"
        - --concurrency
        - "2"
        - --controlPlaneAuthPolicy
        - MUTUAL_TLS
        - --statusPort
        - "15020"
        - --applicationPorts
        - "8080"
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: INSTANCE_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        - name: ISTIO_META_POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: ISTIO_META_CONFIG_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: ISTIO_META_INTERCEPTION_MODE
          value: REDIRECT
        - name: ISTIO_META_INCLUDE_INBOUND_PORTS
          value: "8080"
        - name: ISTIO_METAJSON_LABELS
          value: |
            {"app":"thegym","component":"pmmlevaluator","version":"0.0.1"}
        image: gke.gcr.io/istio/proxyv2:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        lifecycle:
          preStop:
            exec:
              command:
              - sh
              - -c
              - sleep 20; while [ $(netstat -plunt | grep tcp | grep -v envoy | wc
                -l | xargs) -ne 0 ]; do sleep 1; done
        name: istio-proxy
        ports:
        - containerPort: 15090
          name: http-envoy-prom
          protocol: TCP
        readinessProbe:
          failureThreshold: 30
          httpGet:
            path: /healthz/ready
            port: 15020
          initialDelaySeconds: 1
          periodSeconds: 2
        resources:
          limits:
            cpu: "2"
            memory: 1Gi
          requests:
            cpu: 100m
            memory: 128Mi
        securityContext:
          readOnlyRootFilesystem: true
          runAsUser: 1337
        volumeMounts:
        - mountPath: /etc/istio/proxy
          name: istio-envoy
        - mountPath: /etc/certs/
          name: istio-certs
          readOnly: true
      initContainers:
      - args:
        - -p
        - "15001"
        - -u
        - "1337"
        - -m
        - REDIRECT
        - -i
        - '*'
        - -x
        - ""
        - -b
        - "8080"
        - -d
        - "15020"
        image: gke.gcr.io/istio/proxy_init:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        name: istio-init
        resources:
          limits:
            cpu: 100m
            memory: 50Mi
          requests:
            cpu: 10m
            memory: 10Mi
        securityContext:
          capabilities:
            add:
            - NET_ADMIN
          runAsNonRoot: false
          runAsUser: 0
      volumes:
      - emptyDir:
          medium: Memory
        name: istio-envoy
      - name: istio-certs
        secret:
          optional: true
          secretName: istio.default
status: {}
---
kind: Service
apiVersion: v1
metadata:
  name: pmmlevaluator
spec:
  selector:
    app: thegym
    component: pmmlevaluator
    version: 0.0.1    
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  name: uiversion
spec:
  replicas: 1
  selector:
    matchLabels:
      app: thegym
      component: uiversion
      version: 0.0.1
  strategy: {}
  template:
    metadata:
      annotations:
        sidecar.istio.io/status: '{"version":"249fe8117967ad89e644f4ee6f775cd76fc32e399ad4faecc9541b9277053d85","initContainers":["istio-init"],"containers":["istio-proxy"],"volumes":["istio-envoy","istio-certs"],"imagePullSecrets":null}'
      creationTimestamp: null
      labels:
        app: thegym
        component: uiversion
        security.istio.io/tlsMode: istio
        version: 0.0.1
      name: uiversion
    spec:
      containers:
      - env:
        - name: APPDEF
          value: '{''name'':''The Gym'',''showLocation'':''true'',''fields'':[{''name'':''heartrate'',''pivot'':''true'',''type'':''Integer''},{''name'':''user'',''pivot'':false,''type'':''String''},{''name'':''deviceid'',''pivot'':false,''type'':''String''},{''name'':''color'',''pivot'':false,''type'':''String''},{''name'':''id'',''pivot'':''false'',''type'':''Long''},{''name'':''location'',''pivot'':''false'',''type'':''Location''},{''name'':''event_timestamp'',''pivot'':''false'',''type'':''Date/time''}],''transformer'':''%0A%09result%3D%20rawtext%3B%0A%09%09%09%09%09%0A%09%09%09%09%09'',''topic'':''hr'',''table'':''hr'',''keyspace'':''thegym'',''path'':''thegym'',''creator'':'''',''dockerrepo'':'''',''img'':'''',''vis'':'''',''dash'':'''',''hideloader'':''true''}'
        image: digitalemil/thegyminthecloud:microservice-uiversion-v0.0.1-1.0.0
        imagePullPolicy: Always
        name: uiversion
        ports:
        - containerPort: 3024
        resources: {}
      - args:
        - proxy
        - sidecar
        - --domain
        - $(POD_NAMESPACE).svc.cluster.local
        - --configPath
        - /etc/istio/proxy
        - --binaryPath
        - /usr/local/bin/envoy
        - --serviceCluster
        - thegym.$(POD_NAMESPACE)
        - --drainDuration
        - 45s
        - --parentShutdownDuration
        - 1m0s
        - --discoveryAddress
        - istio-pilot.istio-system:15011
        - --zipkinAddress
        - zipkin.istio-system:9411
        - --dnsRefreshRate
        - 300s
        - --connectTimeout
        - 10s
        - --proxyAdminPort
        - "15000"
        - --concurrency
        - "2"
        - --controlPlaneAuthPolicy
        - MUTUAL_TLS
        - --statusPort
        - "15020"
        - --applicationPorts
        - "3024"
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: INSTANCE_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        - name: ISTIO_META_POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: ISTIO_META_CONFIG_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: ISTIO_META_INTERCEPTION_MODE
          value: REDIRECT
        - name: ISTIO_META_INCLUDE_INBOUND_PORTS
          value: "3024"
        - name: ISTIO_METAJSON_LABELS
          value: |
            {"app":"thegym","component":"uiversion","version":"0.0.1"}
        image: gke.gcr.io/istio/proxyv2:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        lifecycle:
          preStop:
            exec:
              command:
              - sh
              - -c
              - sleep 20; while [ $(netstat -plunt | grep tcp | grep -v envoy | wc
                -l | xargs) -ne 0 ]; do sleep 1; done
        name: istio-proxy
        ports:
        - containerPort: 15090
          name: http-envoy-prom
          protocol: TCP
        readinessProbe:
          failureThreshold: 30
          httpGet:
            path: /healthz/ready
            port: 15020
          initialDelaySeconds: 1
          periodSeconds: 2
        resources:
          limits:
            cpu: "2"
            memory: 1Gi
          requests:
            cpu: 100m
            memory: 128Mi
        securityContext:
          readOnlyRootFilesystem: true
          runAsUser: 1337
        volumeMounts:
        - mountPath: /etc/istio/proxy
          name: istio-envoy
        - mountPath: /etc/certs/
          name: istio-certs
          readOnly: true
      initContainers:
      - args:
        - -p
        - "15001"
        - -u
        - "1337"
        - -m
        - REDIRECT
        - -i
        - '*'
        - -x
        - ""
        - -b
        - "3024"
        - -d
        - "15020"
        image: gke.gcr.io/istio/proxy_init:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        name: istio-init
        resources:
          limits:
            cpu: 100m
            memory: 50Mi
          requests:
            cpu: 10m
            memory: 10Mi
        securityContext:
          capabilities:
            add:
            - NET_ADMIN
          runAsNonRoot: false
          runAsUser: 0
      volumes:
      - emptyDir:
          medium: Memory
        name: istio-envoy
      - name: istio-certs
        secret:
          optional: true
          secretName: istio.default
status: {}
---
kind: Service
apiVersion: v1
metadata:
  name: uiversion
spec:
  selector:
    app: thegym
    component: uiversion
    version: 0.0.1    
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3024
---
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  name: loader
spec:
  replicas: 1
  selector:
    matchLabels:
      app: thegym
      component: messageloader
      version: 0.0.1
  strategy: {}
  template:
    metadata:
      annotations:
        sidecar.istio.io/status: '{"version":"249fe8117967ad89e644f4ee6f775cd76fc32e399ad4faecc9541b9277053d85","initContainers":["istio-init"],"containers":["istio-proxy"],"volumes":["istio-envoy","istio-certs"],"imagePullSecrets":null}'
      creationTimestamp: null
      labels:
        app: thegym
        component: messageloader
        security.istio.io/tlsMode: istio
        version: 0.0.1
      name: loader
    spec:
      containers:
      - env:
        - name: APPDEF
          value: '{''name'':''The Gym'',''showLocation'':''true'',''fields'':[{''name'':''heartrate'',''pivot'':''true'',''type'':''Integer''},{''name'':''user'',''pivot'':false,''type'':''String''},{''name'':''deviceid'',''pivot'':false,''type'':''String''},{''name'':''color'',''pivot'':false,''type'':''String''},{''name'':''id'',''pivot'':''false'',''type'':''Long''},{''name'':''location'',''pivot'':''false'',''type'':''Location''},{''name'':''event_timestamp'',''pivot'':''false'',''type'':''Date/time''}],''transformer'':''%0A%09result%3D%20rawtext%3B%0A%09%09%09%09%09%0A%09%09%09%09%09'',''topic'':''hr'',''table'':''hr'',''keyspace'':''thegym'',''path'':''thegym'',''creator'':'''',''dockerrepo'':'''',''img'':'''',''vis'':'''',''dash'':'''',''hideloader'':''true''}'
        - name: LISTENER
          value: http://messagelistener
        - name: APPDIR
          value: /opt/app
        image: digitalemil/thegyminthecloud:microservice-loadgenerator-v0.0.1
        imagePullPolicy: Always
        name: loader
        ports:
        - containerPort: 3000
        resources: {}
      - args:
        - proxy
        - sidecar
        - --domain
        - $(POD_NAMESPACE).svc.cluster.local
        - --configPath
        - /etc/istio/proxy
        - --binaryPath
        - /usr/local/bin/envoy
        - --serviceCluster
        - thegym.$(POD_NAMESPACE)
        - --drainDuration
        - 45s
        - --parentShutdownDuration
        - 1m0s
        - --discoveryAddress
        - istio-pilot.istio-system:15011
        - --zipkinAddress
        - zipkin.istio-system:9411
        - --dnsRefreshRate
        - 300s
        - --connectTimeout
        - 10s
        - --proxyAdminPort
        - "15000"
        - --concurrency
        - "2"
        - --controlPlaneAuthPolicy
        - MUTUAL_TLS
        - --statusPort
        - "15020"
        - --applicationPorts
        - "3000"
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: INSTANCE_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        - name: ISTIO_META_POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: ISTIO_META_CONFIG_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: ISTIO_META_INTERCEPTION_MODE
          value: REDIRECT
        - name: ISTIO_META_INCLUDE_INBOUND_PORTS
          value: "3000"
        - name: ISTIO_METAJSON_LABELS
          value: |
            {"app":"thegym","component":"messageloader","version":"0.0.1"}
        image: gke.gcr.io/istio/proxyv2:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        lifecycle:
          preStop:
            exec:
              command:
              - sh
              - -c
              - sleep 20; while [ $(netstat -plunt | grep tcp | grep -v envoy | wc
                -l | xargs) -ne 0 ]; do sleep 1; done
        name: istio-proxy
        ports:
        - containerPort: 15090
          name: http-envoy-prom
          protocol: TCP
        readinessProbe:
          failureThreshold: 30
          httpGet:
            path: /healthz/ready
            port: 15020
          initialDelaySeconds: 1
          periodSeconds: 2
        resources:
          limits:
            cpu: "2"
            memory: 1Gi
          requests:
            cpu: 100m
            memory: 128Mi
        securityContext:
          readOnlyRootFilesystem: true
          runAsUser: 1337
        volumeMounts:
        - mountPath: /etc/istio/proxy
          name: istio-envoy
        - mountPath: /etc/certs/
          name: istio-certs
          readOnly: true
      initContainers:
      - args:
        - -p
        - "15001"
        - -u
        - "1337"
        - -m
        - REDIRECT
        - -i
        - '*'
        - -x
        - ""
        - -b
        - "3000"
        - -d
        - "15020"
        image: gke.gcr.io/istio/proxy_init:1.2.10-gke.0
        imagePullPolicy: IfNotPresent
        name: istio-init
        resources:
          limits:
            cpu: 100m
            memory: 50Mi
          requests:
            cpu: 10m
            memory: 10Mi
        securityContext:
          capabilities:
            add:
            - NET_ADMIN
          runAsNonRoot: false
          runAsUser: 0
      volumes:
      - emptyDir:
          medium: Memory
        name: istio-envoy
      - name: istio-certs
        secret:
          optional: true
          secretName: istio.default
status: {}
---
