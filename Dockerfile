FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

ENV PORT=8000

CMD ["node", "src/server.js"]
