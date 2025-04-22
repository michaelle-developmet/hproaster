FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install 
RUN npm install multer

COPY . .

EXPOSE 5011

CMD ["node", "server.js"]