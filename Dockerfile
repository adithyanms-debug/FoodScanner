# ---- Stage 1: Build ----
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Accept the API key as a build arg so it gets baked into the static bundle
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Build the production bundle
RUN npm run build

# ---- Stage 2: Serve ----
FROM nginx:stable-alpine

# Copy the built assets to Nginx's default serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# SPA support: redirect all routes to index.html
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
