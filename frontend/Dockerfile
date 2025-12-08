FROM node:22.12.0

WORKDIR /app

# Copy installation and configuration files
COPY package.json package-lock.json ./

# Copy configuration files and source code
COPY .env ./
COPY public ./public/
COPY src ./src/
COPY index.html ./
COPY tsconfig.app.json ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./


# Define build arguments
ARG VITE_FRONTEND_IP
ARG VITE_BACKEND_IP

ARG VITE_FRONTEND_PORT
ARG VITE_BACKEND_PORT

# Expose arguments as environment variables
ENV VITE_FRONTEND_IP=${VITE_FRONTEND_IP}
ENV VITE_BACKEND_IP=${VITE_BACKEND_IP}
ENV VITE_FRONTEND_PORT=${VITE_FRONTEND_PORT}
ENV VITE_BACKEND_PORT=${VITE_BACKEND_PORT}

# Prepare the application (install, generate db, compile TypeScript)
RUN npm run prestart

# Expose application ports
EXPOSE ${VITE_FRONTEND_PORT}
EXPOSE ${VITE_BACKEND_PORT}

CMD ["npm", "run", "start"]
