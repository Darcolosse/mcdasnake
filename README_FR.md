# McDaSnake 🐍

> [!CAUTION]
> Vous pouvez trouver le [README IN ENGLISH](./README.md) si vous préférez.

McDaSnake est un jeu de serpent multijoueur en temps réel basé sur une architecture frontend/backend. Les joueurs contrôlent des serpents sur une grille partagée, mangent des pommes pour grandir et rivalisent pour obtenir le meilleur score. Le backend gère la logique du jeu, les connexions WebSocket et la persistance des scores, tandis que le frontend, développé avec Vue 3 et Vite, offre une interface personnalisable via une page de paramètres dédiée.

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

---

## 🎮 Fonctionnalités

- **Jeu multijoueur en temps réel** : Jouez simultanément avec d'autres joueurs sur une grille partagée.
- **Suivi des scores en direct** : Système de classement pour suivre les scores et les réalisations des joueurs.
- **Sessions de jeu (bientôt)** : Gestion structurée des parties avec plusieurs sessions simultanées.
- **Apparition dynamique des pommes** : Pommes générées aléatoirement avec des mécaniques de bonus.
- **Interface réactive** : Interface moderne avec Vue 3 et un style Tailwind CSS.
- **Effets sonores et visuels** : Expérience de jeu améliorée avec des sprites et de l'audio.
- **Support Docker** : Déploiement facile avec Docker et Docker Compose.
- **Autorité côté serveur** : Serveur de jeu autoritaire pour éviter la triche.
- **Données persistantes** : Scores stockés via Prisma ORM et SQLite.

---

## 🏗️ Architecture

McDaSnake est construit avec une **architecture client-serveur** :

### Backend
- **Framework** : Express.js + Node.js avec TypeScript.
- **Communication en temps réel** : WebSocket (bibliothèque ws) pour les événements de jeu.
- **Base de données** : SQLite avec Prisma ORM pour les données persistantes.
- **Moteur de jeu** : Boucle de jeu basée sur des événements avec des mises à jour planifiées.
- **API** : Points de terminaison RESTful pour les statistiques.

### Frontend
- **Framework** : Vue 3 avec TypeScript.
- **Routing** : Vue Router pour la navigation.
- **Style** : Tailwind CSS pour un design réactif.
- **Outil de build** : Vite pour un développement rapide et des builds optimisées.
- **Réseau** : Client WebSocket pour les mises à jour en temps réel du jeu.

---

## 🚀 Pour commencer

### Prérequis
- Node.js 22+
- npm
- Docker (pour le déploiement conteneurisé)

### Développement local

#### Configuration du backend
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

Le backend démarrera avec :
- **Serveur de jeu** : WebSocket sur `BACKEND_IP:BACKEND_PORT` configuré.
- **API REST** : HTTP sur `API_IP:API_PORT` configuré.

#### Configuration du frontend
```bash
cd frontend
npm install
npm run dev
```

Le frontend sera disponible à l'adresse `http://VITE_FRONTEND_IP:VITE_FRONTEND_PORT`.

---

## 🐳 Déploiement avec Docker

### Utilisation de Docker Compose (recommandé)

> [!CAUTION]
> Veuillez modifier le fichier [.env général](./.env) pour la configuration réseau **(écrase les autres fichiers .env)** ainsi que les fichiers [.env du frontend](./frontend/.env) et [.env du backend](./backend/.env) pour la configuration du jeu.

```bash
docker-compose up --build
```

En mode détaché :
```bash
docker-compose up --build -d
```

Cela permettra automatiquement de :
1. Construire et démarrer le serveur backend.
2. Construire et démarrer l'application frontend.
3. Créer des volumes persistants pour la base de données et les logs.
4. Exposer tous les ports nécessaires.
5. Configurer la mise en réseau entre les services.

### Déploiement manuel avec Docker

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

---

## ⚙️ Configuration

- [.env général](./.env) pour la configuration réseau si exécuté avec Docker Compose **(écrase les autres fichiers .env)**.
- [.env du frontend](./frontend/.env) pour indiquer où atteindre le backend.
- [.env du backend](./backend/.env) pour la configuration du jeu.

---

## 📡 Protocole de jeu

### Événements WebSocket

#### Client → Serveur
- **GameAddPlayer** : Rejoindre une session de jeu avec le nom et le design du joueur.
- **GameUpdateSnakeDirection** : Envoyer la direction du serpent (HAUT, BAS, GAUCHE, DROITE).
- **GameRemovePlayer** : Quitter la session de jeu.
- **GamePing** : Signal de vie pour calculer le RTT.

#### Serveur → Client
- **GameRefresh** : Mise à jour complète de l'état du jeu (toutes les entités, tableau des scores).
- **GameUpdate** : Changements incrémentiels de l'état du jeu.
- **GameDeadPlayer** : Notification de mort du joueur avec l'emplacement de la mort.
- **GamePingResponse** : Réponse au signal de vie.

### Entités du jeu
- **Snake** : Entité contrôlée par le joueur avec un historique de position et un tampon de direction.
- **Apple** : Objets collectibles qui augmentent le score.

---

## 🎯 Mécaniques de jeu

- **Mouvement** : Les serpents se déplacent en continu dans une direction, avec une entrée directionnelle tamponnée.
- **Collision** : Les serpents meurent en heurtant les limites, d'autres serpents ou leur propre corps.
- **Scoring** : Manger des pommes augmente le score ; tuer d'autres joueurs rapporte des points bonus.
- **Système de bonus** : Des pommes bonus de haute valeur apparaissent aléatoirement (probabilité configurable par tick).
- **Durée de la session** : Les jeux durent une durée configurée avec un nettoyage automatique des sessions.
- **Classement** : Classement en temps réel basé sur la performance des joueurs.

---

## 🔧 Composants clés du backend

| Composant | Rôle |
|-----------|------|
| **GameManager** | Orchestre la logique du jeu, gère les tampons, traite les événements réseau. |
| **GameScheduler** | Gère la boucle de jeu et les mises à jour d'état à intervalles fixes. |
| **NetworkManager** | Gère les connexions WebSocket, achemine les messages, compression. |
| **Game** | État principal du jeu, détection des collisions, gestion des entités. |
| **ScoreBoard** | Persiste les statistiques des joueurs dans la base de données via Prisma. |
| **Snake, Apple** | Classes d'entités de jeu qui définissent le comportement des entités. |

---

## 🎨 Composants du frontend

| Composant | Rôle |
|-----------|------|
| **GameManager** | Synchronisation de l'état du jeu côté client. |
| **DisplayManager** | Affiche les entités du jeu, gère les couches d'affichage. |
| **NetworkManager** | Client WebSocket, sérialisation/désérialisation des messages. |
| **EventManager** | Gestion des entrées utilisateur, traitement des événements de jeu. |
| **SoundManager** | Lecture audio pour les événements de jeu. |
| **SpriteManager** | Chargement, rendu et animation des sprites. |
| **GridHelper** | Conversion de coordonnées et utilitaires de grille. |

---

## 📊 Schéma de la base de données

Utilisation de SQLite avec Prisma ORM :

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

---

## 🔐 Fonctionnalités de sécurité

- **Autorité côté serveur** : Tous les états de jeu sont validés côté serveur pour éviter la triche.
- **Compression WebSocket** : Compression deflate par message pour réduire la bande passante.
- **Validation des entrées** : Toutes les entrées client sont validées avant traitement.
- **Sécurité des types** : Implémentation complète en TypeScript pour éviter les erreurs d'exécution.

---

## 📈 Considérations de performance

- **Boucle de jeu** : Planificateur à intervalle fixe pour un gameplay cohérent.
- **Compression des messages** : WebSocket utilise la compression pour réduire la charge réseau.
- **Pooling d'entités** : Gestion efficace des entités avec un stockage basé sur Map.
- **Rendu côté client** : Rendu basé sur Canvas pour des graphismes fluides utilisant l'API Canvas par défaut et WebGL.

---

## 📄 Licence

McDaSnake est sous licence `GNU General Public License v3.0`.

---

✨🎮 **McDaSnake** - Le jeu Snake multijoueur pour le web moderne ! 🎮✨
