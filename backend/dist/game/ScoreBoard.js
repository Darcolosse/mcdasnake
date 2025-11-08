"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreBoard = void 0;
class ScoreBoard {
    scores;
    db;
    constructor(db) {
        this.scores = new Map();
        this.db = db;
    }
    createGameSession(sessionId) {
        this.createGameSessionScoreboard(sessionId);
    }
    createScore(playerId, playerName, sessionId, score = 0, kills = 0, apples = 0) {
        const currentScore = this.scores.get(playerId) || [0, 0, 0];
        this.scores.set(playerId, [currentScore[0] + score, currentScore[1] + kills, currentScore[2] + apples]);
        this.addSnakeScoreBoard(playerId, playerName, sessionId, score, kills, apples);
    }
    updateScore(playerId, score, kills, apples) {
        const currentScore = this.scores.get(playerId) || [0, 0, 0];
        this.scores.set(playerId, [currentScore[0] + score, currentScore[1] + kills, currentScore[2] + apples]);
        this.updateSnakeScoreBoard(playerId, score, kills, apples);
    }
    getAllScores() {
        return this.scores;
    }
    getScore(playerId) {
        return this.scores.get(playerId);
    }
    async addSnakeScoreBoard(playerId, playerName, gameSessionId, score = 0, kills = 0, apples = 0) {
        await this.db.scoreBoard.create({
            data: {
                id: playerId,
                userName: playerName,
                score: score,
                kills: kills,
                apples: apples,
                gameSessionId: gameSessionId
            }
        });
    }
    ;
    async updateSnakeScoreBoard(playerId, score, kills, apples) {
        await this.db.scoreBoard.updateMany({
            where: { id: playerId },
            data: {
                score: { increment: score },
                kills: { increment: kills },
                apples: { increment: apples }
            }
        });
    }
    ;
    async createGameSessionScoreboard(sessionId) {
        await this.db.gameSession.create({
            data: {
                sessionId: sessionId
            }
        });
    }
}
exports.ScoreBoard = ScoreBoard;
