# ---------- Build stage ----------
FROM public.ecr.aws/docker/library/node:22-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM public.ecr.aws/docker/library/nginx:alpine

# Allow non-root nginx user to write where it needs to
RUN mkdir -p /var/cache/nginx/client_temp /var/run /var/log/nginx \
    && chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx

# Custom nginx config to listen on 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static files from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

# Run as non-root user (assignment requirement)
USER nginx

CMD ["nginx", "-g", "daemon off;"]
