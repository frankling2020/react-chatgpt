FROM node:20.11.1-bullseye-slim

WORKDIR /app
COPY package*.json ./
RUN npm install
ENV PATH /app/node_modules/.bin:$PATH
COPY . .
RUN npm run build
CMD [ "npm", "run", "start"]