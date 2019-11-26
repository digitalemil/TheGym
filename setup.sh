
#minikube start --cpus=4 --memory="24000" --vm-driver='virtualbox'

#curl -o kubectl-kudo -LJO https://github.com/kudobuilder/kudo/releases/download/v0.8.0/kubectl-kudo_0.8.0_darwin_x86_64
#chmod +x kubectl-kudo
kubectl kudo init
kubectl kudo install zookeeper
sleep 20
kubectl get instances
kubectl get statefulset zookeeper-instance-zookeeper
sleep 20
kubectl kudo install kafka

sleep 120

kubectl apply -f infra.yaml

sleep 90 

kubectl apply -f elasticjob.yaml

sleep 60 

kubectl apply -f app.yaml

sleep 60

kubectl apply -f kafkajob.yaml

export UIHOSTANDPORT=$(minikube service ui | grep http | sed 's|.*http://||g' | sed 's/\(.*\) .*/\1/g')

export KIBANAHOSTANDPORT=$(minikube service kibana | grep http | sed 's|.*http://||g' | sed 's/\(.*\) .*/\1/g')

export JSON='{"me":"kibana", "value":"'$KIBANAHOSTANDPORT'"}'

echo $JSON>kibanahostandport

sleep 30

curl -X POST --data-binary "@kibanahostandport" http://$UIHOSTANDPORT/sethostnameandport

minikube dashboard &

