# RUN with sudo docker-compose up --build -d

FROM node:14-alpine3.10

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

#RUN apk add --no-cache bash

#RUN ["chmod", "+x", "/src/scripts/wait-for-it.sh"]

RUN ["chmod", "+x", "./scripts/wait-for-it.sh"]

CMD ./scripts/wait-for-it.sh crmongo:27024 -t 15 -- npm run start