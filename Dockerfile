# RUN with `sudo docker-compose up --build -d -t countingman`

FROM node:14-alpine3.10 as counting-builder

WORKDIR /app

COPY package*.json ./

RUN npm ci
#RUN npm run build:prod
#RUN npm prune --production
COPY . .

RUN npm run build:prod

RUN dos2unix ./scripts/wait-for-it.sh

FROM node:14-alpine3.10 as counting-runner

WORKDIR /app

COPY --from=counting-builder ./app/dist ./dist

COPY --from=counting-builder ./app/scripts ./scripts

COPY package* ./ 

RUN npm install --production

RUN apk add --no-cache bash

#RUN ["chmod", "+x", "/src/scripts/wait-for-it.sh"]

CMD chmod +x ./scripts/wait-for-it.sh && bash ./scripts/wait-for-it.sh crmongo:27024 -t 15 -- npm run run