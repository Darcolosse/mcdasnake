# McDaSnake 🐍

> [!CAUTION]
> You can find the [README (French)](./README_FR.md) in French if you prefer

McdaSnake is a real-time multiplayer snake game built on a frontend/backend architecture.
Players control snakes on a shared grid, eat apples to grow, and compete to achieve the highest score. The backend handles game logic, WebSocket connections, and score persistence, while the frontend, developed with Vue 3 and Vite, provides a customizable interface through a dedicated settings page.

<p align="center">
  <img src="https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" />
  <br>
  <img src="https://img.shields.io/badge/Vue%20js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=Socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" />
</p> 

## 🎮 Features

- **Real-time Multiplayer Gameplay**: Play simultaneously with other players on a shared grid
- **Live Score Tracking**: Leaderboard system to track player scores and achievements
- **Game Sessions (soon)**: Structured game management with multiple concurrent sessions
- **Dynamic Apple Spawning**: Randomly spawned apples with bonus mechanics
- **Responsive UI**: Modern Vue 3 interface with Tailwind CSS styling
- **Sound & Visual Effects**: Enhanced gaming experience with sprites and audio
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Server-side Authority**: Authoritative game server prevents cheating
- **Persistent Data**: Scores stored via Prisma ORM and SQLite

## 🏗️ Architecture

McDaSnake is built with a **client-server architecture**:

### Backend
- **Framework**: Express.js + Node.js with TypeScript
- **Real-time Communication**: WebSocket (ws library) for game events
- **Database**: SQLite with Prisma ORM for persistent data
- **Game Engine**: Event-driven game loop with scheduled updates
- **API**: RESTful endpoints for statistics

### Frontend
- **Framework**: Vue 3 with TypeScript
- **Routing**: Vue Router for navigation
- **Styling**: Tailwind CSS for responsive design
- **Build Tool**: Vite for fast development and optimized production builds
- **Network**: WebSocket client for real-time game updates

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- npm
- Docker (for containerized deployment)

### Local Development

#### Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

The backend will start with:
- **Game Server**: WebSocket on configured BACKEND_IP:BACKEND_PORT
- **REST API**: HTTP on configured API_IP:API_PORT

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://VITE_FRONTEND_IP:VITE_FRONTEND_PORT`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

> [!CAUTION]
> Please modify the [general .env](./.env) for network configuration **(overwrite other .env)** and the [frontend .env](./frontend/.env) and [backend .env](./frontend/.env) for game configuration.

```bash
docker-compose up --build
```

In detached mode:
```bash
docker-compose up --build -d
```

This will automatically:
1. Build and start the backend server
2. Build and start the frontend application
3. Create persistent volumes for database and logs
4. Expose all necessary ports
5. Configure networking between services

### Manual Docker Deployment

#### Backend
```bash
docker build \
    --build-arg BACKEND_IP=0.0.0.0 \
    --build-arg API_IP=0.0.0.0 \
    --build-arg BACKEND_PORT=5001 \
    --build-arg API_PORT=5002 \
    -t mcdasnake_backend ./backend

docker run -d \
    -p 5001:5001 -p 5002:5002 \
    -v mcdasnake_database:/app/prisma \
    -v mcdasnake_logs:/app/logs \
    mcdasnake_backend
```

#### Frontend
```bash
docker build \
    --build-arg VITE_FRONTEND_IP=0.0.0.0 \
    --build-arg VITE_BACKEND_IP=localhost \
    --build-arg VITE_FRONTEND_PORT=5000 \
    --build-arg VITE_BACKEND_PORT=5001 \
    -t mcdasnake_frontend ./frontend

docker run -d \
    -p 5000:5000 \
    -v mcdasnake_logs:/app/logs \
    mcdasnake_frontend
```

## ⚙️ Configuration

- [general .env](./.env) for network configuration if run with docker compose **(overwrite other .env)** 
- [frontend .env](./frontend/.env) addresses where to reach the backend
- [backend .env](./frontend/.env) for game configuration.

## 📡 Game Protocol

### WebSocket Events

#### Client → Server
- **GameAddPlayer**: Join a game session with player name and design
- **GameUpdateSnakeDirection**: Send snake direction input (UP, DOWN, LEFT, RIGHT)
- **GameRemovePlayer**: Leave the game session
- **GamePing**: Heartbeat to calculate RTT

#### Server → Client
- **GameRefresh**: Complete game state update (all entities, scoreboard)
- **GameUpdate**: Incremental game state changes
- **GameDeadPlayer**: Player death notification with death location
- **GamePingResponse**: Heartbeat response

### Game Entities

- **Snake**: Player-controlled entity with position history and direction buffer
- **Apple**: Collectible items that increase score

## 🎯 Game Mechanics

- **Movement**: Snakes move continuously in one direction, with buffered directional input
- **Collision**: Snakes die when hitting boundaries, other snakes, or their own body
- **Scoring**: Eating apples increases score; killing other players grants bonus points
- **Bonus System**: High-value bonus apples spawn randomly (configurable probability per tick)
- **Session Duration**: Games run for a configured duration with automatic session cleanup
- **Leaderboard**: Real-time ranking based on player performance

## 🔧 Key Backend Components

| Component | Purpose |
|-----------|---------|
| **GameManager** | Orchestrates game logic, manages buffers, handles network events |
| **GameScheduler** | Manages game loop and state updates at fixed intervals |
| **NetworkManager** | Handles WebSocket connections, routes messages, compression |
| **Game** | Core game state, collision detection, entity management |
| **ScoreBoard** | Persists player statistics to database via Prisma |
| **Snake, Apple** | Game entity classes that defines how entities behave |

## 🎨 Frontend Components

| Component | Purpose |
|-----------|---------|
| **GameManager** | Client-side game state synchronization |
| **DisplayManager** | Renders game entities, manages display layers |
| **NetworkManager** | WebSocket client, message serialization/deserialization |
| **EventManager** | User input handling, game event processing |
| **SoundManager** | Audio playback for game events |
| **SpriteManager** | Sprite loading, rendering, and animation |
| **GridHelper** | Coordinate conversion and grid utilities |

## 📊 Database Schema

Using SQLite with Prisma ORM:

```prisma
model GameSession {
  id        Int          @id @default(autoincrement())
  sessionId String       @unique
  players   ScoreBoard[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

model ScoreBoard {
  id            String      @unique
  userName      String
  score         Int
  kills         Int
  apples        Int
  gameSession   GameSession @relation(fields: [gameSessionId], references: [sessionId])
  gameSessionId String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@id([id, gameSessionId])
}
```

## 🔐 Security Features

- **Server-side Authority**: All game state validated on server to prevent cheating
- **WebSocket Compression**: Per-message deflate compression reduces bandwidth
- **Input Validation**: All client input validated before processing
- **Type Safety**: Full TypeScript implementation prevents runtime errors

## 📈 Performance Considerations

- **Game Loop**: Fixed-interval scheduler for consistent gameplay
- **Message Compression**: WebSocket onboards compression to reduce network overhead
- **Entity Pooling**: Efficient entity management with Map-based storage
- **Client-side Rendering**: Canvas-based rendering for smooth graphics utilizing default Canvas API and WebGL

## 📄 License

McDaSnake is under `GNU General Public License v3.0`.

---

✨🎮 **McDaSnake** - Bringing multiplayer Snake into the modern web! 🎮✨


