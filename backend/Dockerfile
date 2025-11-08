# Utilise une image Node.js légère
FROM node:18-alpine

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers de configuration et d'installation
COPY package.json package-lock.json ./

# Copie les fichiers de configuration et le code source
COPY .env ./
COPY prisma ./prisma/
COPY src ./src/
COPY _module-alias.js ./
COPY tsconfig.json ./

# Définit les arguments de build
ARG BACKEND_IP
ARG API_IP
ARG BACKEND_PORT
ARG API_PORT

# Expose les arguments comme variables d'environnement
ENV BACKEND_IP=${BACKEND_IP}
ENV API_IP=${API_IP}
ENV BACKEND_PORT=${BACKEND_PORT}
ENV API_PORT=${API_PORT}

# Prépare l'application (installe, génère Prisma, compile TypeScript)
RUN npm run prestart

# Expose le port de l'application
EXPOSE ${BACKEND_PORT}
EXPOSE ${API_PORT}

# Démarre l'application avec module-alias
CMD ["node", "-r", "./_module-alias.js", "dist/app.js"]
