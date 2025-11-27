import { PrismaClient } from '@prisma/client';

export class ScoreBoard {
    private scores: Map<string, [string, number, number, number]>;
    private readonly db: PrismaClient;

    constructor(db: PrismaClient) {
        this.scores = new Map<string, [string, number, number, number]>();
        this.db = db;
    }

    public createGameSession(sessionId: string): void {
        this.createGameSessionScoreboard(sessionId);
    }

    public async createScore(playerId: string, playerName: string, sessionId: string, score: number = 0, kills: number = 0, apples: number = 0): Promise<void> {
        if (await this.getSnakeScoreBoard(playerId)) {
            return;
        }
        const currentScore = this.scores.get(playerId) || [0, 0, 0, 0];
        this.scores.set(playerId, [playerName, currentScore[1] + score, currentScore[2] + kills, currentScore[3] + apples]);
        this.addSnakeScoreBoard(playerId, playerName, sessionId, score, kills, apples);
    }

    public updateScore(playerId: string, score: number, kills: number, apples: number): void {
        const currentScore = this.scores.get(playerId) || ["null", 0, 0, 0, 0];
        this.scores.set(playerId, [currentScore[0], currentScore[1] + score, currentScore[2] + kills, currentScore[3] + apples]);
        this.updateSnakeScoreBoard(playerId, score, kills, apples);
    }

    public resetScores(playerId: string): void {
        this.scores.set(playerId, [this.scores.get(playerId)?.[0] || "null", 0, 0, 0]);
        this.resetSnakeScoreBoard(playerId);
    }

    public getAllScores(): Map<string, [string, number, number, number]> {
        return this.scores;
    }

    public getScore(playerId: string): [string, number, number, number] | undefined {
        return this.scores.get(playerId);
    }

    private async getSnakeScoreBoard(playerId: string) {
        return await this.db.scoreBoard.findUnique({
            where: { id: playerId }
        });
    }

    private async addSnakeScoreBoard(playerId: string, playerName: string, gameSessionId: string, score: number = 0, kills: number = 0, apples: number = 0) {
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
    };

    private async updateSnakeScoreBoard(playerId: string, score: number, kills: number, apples: number) {
        await this.db.scoreBoard.updateMany({
            where: { id: playerId },
            data: {
                score: { increment: score },
                kills: { increment: kills },
                apples: { increment: apples }
            }
        });
    };

    private async resetSnakeScoreBoard(playerId: string) {
        await this.db.scoreBoard.updateMany({
            where: { id: playerId },
            data: {
                score: 0,
                kills: 0,
                apples: 0
            }
        });
    }

    private async createGameSessionScoreboard(sessionId: string) {
        await this.db.gameSession.create({
            data: {
                sessionId: sessionId
            }
        });
    }
}