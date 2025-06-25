FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Статика из фронта (если Express будет обслуживать фронт)
# COPY ../HRFB/roaster/.output/public ./public

EXPOSE 5011
CMD ["node", "server.js"]
