FROM node:24.14.0-alpine3.23
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && mkdir /app/logs && chown node:node /app/logs
COPY --chown=node:node server.js ./
COPY --chown=node:node public ./public
USER node
EXPOSE 3001
CMD ["node","server.js"]
