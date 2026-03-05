FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./

# CRA bakes env vars at build time
ARG REACT_APP_API_URL=/api
ARG REACT_APP_AUTH0_DOMAIN
ARG REACT_APP_AUTH0_CLIENT_ID
ARG REACT_APP_AUTH0_AUDIENCE

ENV REACT_APP_API_URL=$REACT_APP_API_URL \
  REACT_APP_AUTH0_DOMAIN=$REACT_APP_AUTH0_DOMAIN \
  REACT_APP_AUTH0_CLIENT_ID=$REACT_APP_AUTH0_CLIENT_ID \
  REACT_APP_AUTH0_AUDIENCE=$REACT_APP_AUTH0_AUDIENCE

RUN npm run build

FROM nginx:1.25-alpine

COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=10 \
  CMD wget -qO- "http://localhost/nginx-health" >/dev/null 2>&1 || exit 1
