# McdaSnake
This project is a multiplayer Snake game implemented with Node.js, Express and Prisma. It provides a real-time, browser-based experience where multiple players control snakes on the same board and compete to score points. The project was developed for coursework at ENSEEIHT.

### Key features
- Real-time multiplayer gameplay using WebSockets.
- Server-side game loop and authoritative state to prevent cheating.
- Persistent player and match data stored via Prisma and a SQL database.
- Docker support for easier deployment and environment consistency.


### Prerequisites
- Node.js v22
- npm 
- Docker (if you want to conteneurize app)


### Configuration
- Backend configuration is driven by environment variables. The Dockerfile and run commands in this repository accept the following build/run args and env vars (examples):
    - BACKEND_IP, API_IP — IP addresses to bind the services
    - BACKEND_PORT, API_PORT — ports used by the services



## How to run ?

### Run all
You just need to have docker-compose
```bash
docker compose up --build 
```
In detatch mode 
```bash
docker compose up --build -d 
```

#### Backend (Node)
1. Open a terminal and navigate to the backend folder:
```bash
cd ./backend
```
2. Install dependencies, create database and compile typscript:
```bash
npm run prestart
```
3. Start the backend server:
```bash
npm run start
```


#### Backend (Docker)
1. Build the Docker image. Adjust build args and ports as needed:
```bash
docker build \
    --build-arg BACKEND_IP=0.0.0.0 \
    --build-arg API_IP=0.0.0.0 \
    --build-arg BACKEND_PORT=5001 \
    --build-arg API_PORT=5002 \
    -t mcdasnake_backend .
```
2. Run a container with persistent volumes for the database and logs:
```bash
docker run -d \
    -p 5001:5001 -p 5002:5002 \
    -v mcdasnake_database:/app/prisma \
    -v mcdasnake_logs:/app/logs \
    mcdasnake_backend
```


#### Frontend (Node)
1. Open a terminal and navigate to the backend folder:
```bash
cd ./frontend
```
2. Install dependencies, create database and compile typscript:
```bash
npm run prestart
```
3. Start the backend server:
```bash
npm run start
```


#### Frontend (Docker)
1. Build the Docker image. Adjust build args and ports as needed:
```bash
docker build \
    --build-arg VITE_FRONTEND_IP=0.0.0.0 \
    --build-arg VITE_BACKEND_IP=localhost \
    --build-arg VITE_FRONTEND_PORT=5000 \
    --build-arg VITE_BACKEND_PORT=5001 \
    -t mcdasnake_frontend .
```

2. Run a container with persistent volumes for the database and logs:
```bash
docker run -d \
    -p 5000:5000 \
    -v mcdasnake_logs:/app/logs \
    mcdasnake_frontend
```


