#!/bin/bash

echo 'Rodando testes unitários'
cd src/service/api
npm install

npm test

echo '5 segundos para ver o resultado dos testes. Contando...'
sleep 5

cd ../../..

echo 'Parando seus contêiners atuais'
sudo docker stop $(sudo docker ps -aq)


echo "Iniciando Docker Compose"
sudo docker-compose up --build --detach

echo "Visualizando contêiners"
sudo docker ps

cd src/service/api

echo "Vamos iniciar o load-test em 5 segundos"
sleep 5

npm run loadtest