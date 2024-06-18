FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/assetmgr

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

COPY . .

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3002

CMD [ "node", "app.js" ]