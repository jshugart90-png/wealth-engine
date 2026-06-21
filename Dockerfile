FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=8787
ENV HOST=0.0.0.0
EXPOSE 8787

CMD ["npm", "run", "run:daemon"]
