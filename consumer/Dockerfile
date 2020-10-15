FROM node:12

# Create app directory
WORKDIR /src/consumer

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . /src/consumer

EXPOSE 5000
CMD [ "node" , "index.js" ]