FROM node:14

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

CMD ./scripts/wait-for-it.sh mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@mongo:27017/${MONGO_INITDB_DATABASE}?authSource=admin -t 30 -- npm run start