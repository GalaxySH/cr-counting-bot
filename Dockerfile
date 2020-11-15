# RUN with `sudo docker-compose up --build -d -t countingman`

FROM node:14-alpine3.10

WORKDIR /app

COPY package*.json ./

RUN npm ci
#RUN npm run build:prod
#RUN npm prune --production

COPY . .

RUN apk add --no-cache bash

#RUN ["chmod", "+x", "/src/scripts/wait-for-it.sh"]

CMD dos2unix ./scripts/wait-for-it.sh && chmod +x ./scripts/wait-for-it.sh && bash ./scripts/wait-for-it.sh crmongo:27024 -t 15 -- npm run start