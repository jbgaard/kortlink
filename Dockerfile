FROM node:12

# Create app dir
WORKDIR /usr/src/kortlink

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle APP sources
COPY . .

# App bruger port 3001 så denne skal offentliggøres
EXPOSE 3001

# Definer kommando som kan bruges til at starte app
CMD ["node", "server.js"]