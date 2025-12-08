FROM node:22.12.0

WORKDIR /app

# Copy installation and configuration files
COPY package.json package-lock.json ./

# Copy configuration files and source code
COPY .env ./
COPY prisma ./prisma/
COPY src ./src/
COPY _module-alias.js ./
COPY tsconfig.json ./

# Define build arguments
ARG BACKEND_IP
ARG API_IP
ARG BACKEND_PORT
ARG API_PORT

# Expose arguments as environment variables
ENV BACKEND_IP=${BACKEND_IP}
ENV API_IP=${API_IP}
ENV BACKEND_PORT=${BACKEND_PORT}
ENV API_PORT=${API_PORT}

# Prepare the application (install, generate db, compile TypeScript)
RUN npm run prestart

# Expose application ports
EXPOSE ${BACKEND_PORT}
EXPOSE ${API_PORT}

# Start the application
CMD ["node", "-r", "./_module-alias.js", "dist/app.js"]
