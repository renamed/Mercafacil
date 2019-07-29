#!/bin/bash

echo 'Parando seus contêiners atuais'
sudo docker stop $(sudo docker ps -aq)


echo "Iniciando Docker Compose"
sudo docker-compose up --build --detach

echo "Visualizando contêiners"
sudo docker ps

cd src/service/api

echo "Vamos iniciar o load-test em 1 segundo"
sleep 1

npm run loadtest