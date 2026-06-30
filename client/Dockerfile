FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json

RUN npm install

COPY . .

RUN npm run build -w client

EXPOSE 4173

CMD ["node", "client/scripts/serve.mjs"]
