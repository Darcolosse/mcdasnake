import { PrismaClient } from '@prisma/client';

export class ScoreBoard {
    private scores: Map<string, [number, number, number]>;
    private readonly db: PrismaClient;

    constructor(db: PrismaClient) {
        this.scores = new Map<string, [number, number, number]>();
        this.db = db;
    }

    public createGameSession(sessionId: string): void {
        this.createGameSessionScoreboard(sessionId);
    }


    public createScore(playerName: string, sessionId: string, score: number = 0, kills: number = 0, apples: number = 0): void {
        const currentScore = this.scores.get(playerName) || [0, 0, 0];
        this.scores.set(playerName, [currentScore[0] + score, currentScore[1] + kills, currentScore[2] + apples]);
        this.addSnakeScoreBoard(playerName, sessionId, score, kills, apples);
    }

    public updateScore(playerName: string, score: number, kills: number, apples: number): void {
        const currentScore = this.scores.get(playerName) || [0, 0, 0];
        this.scores.set(playerName, [currentScore[0] + score, currentScore[1] + kills, currentScore[2] + apples]);
        this.updateSnakeScoreBoard(playerName, score, kills, apples);
    }

    public getAllScores(): Map<string, [number, number, number]> {
        return this.scores;
    }

    public getScore(playerName: string): [number, number, number] | undefined {
        return this.scores.get(playerName);
    }

    private async addSnakeScoreBoard(playerName: string, gameSessionId: string, score: number = 0, kills: number = 0, apples: number = 0) {
        await this.db.scoreBoard.create({
            data: {
                userName: playerName,
                score: score,
                kills: kills,
                apples: apples,
                gameSessionId: gameSessionId
            }
        });
    };

    private async updateSnakeScoreBoard(playerName: string, score: number, kills: number, apples: number) {
        await this.db.scoreBoard.updateMany({
            where: { userName: playerName },
            data: {
                score: { increment: score },
                kills: { increment: kills },
                apples: { increment: apples }
            }
        });
    };

    private async createGameSessionScoreboard(sessionId: string) {
        await this.db.gameSession.create({
            data: {
                sessionId: sessionId
            }
        });
    }

    /*
    private async getSnakeScoreBoard(playerName: string) {
        return await this.db.scoreBoard.findMany({
            where: { userName: playerName }
        });
    }

    private async getAllSnakeScoreBoards() {
        return await this.db.scoreBoard.findMany();
    }*/
}