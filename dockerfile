FROM node:18-alpine

WORKDIR /app

ARG VITE_ROOT_URL
ARG VITE_GRAPHQL_BACKEND_URL
ARG VITE_GRAPHQL_BACKEND_WS_URL

ENV VITE_ROOT_URL=$VITE_ROOT_URL
ENV VITE_GRAPHQL_BACKEND_URL=$VITE_GRAPHQL_BACKEND_URL
ENV VITE_GRAPHQL_BACKEND_WS_URL=$VITE_GRAPHQL_BACKEND_WS_URL

COPY package.json package-lock.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm i
RUN pnpm i typescript --save-dev

COPY . ./

RUN pnpm run build

EXPOSE 4173

CMD ["pnpm", "preview"]
