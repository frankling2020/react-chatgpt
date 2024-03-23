FROM node:bullseye-slim

WORKDIR /app
COPY package*.json ./
RUN npm install
ENV PATH /app/node_modules/.bin:$PATH
COPY . .

# No need to run the server here, it will be run by the nginx server
# CMD [ "npm", "run", "start"]
RUN npm run build