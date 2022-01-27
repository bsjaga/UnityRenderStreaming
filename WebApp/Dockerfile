FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

ARG websocket="-w"
ARG argPort="80"

ENV WS=$websocket
ENV port=$argPort

EXPOSE $port

ENTRYPOINT npm run start -- $WS -p $port 