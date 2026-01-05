import { LevelConfig } from './LevelManager';

export class GameController {
    public level: LevelConfig;
    public timeRemaining: number;
    public enemiesRemaining: number;
    public enemiesDestroyed: number;
    public isPaused: boolean;
    public isGameOver: boolean;
    public score: number = 0;

    constructor(level: LevelConfig) {
        this.level = level;
        this.reset();
    }

    public reset(): void {
        this.timeRemaining = this.level.timeLimit;
        this.enemiesRemaining = this.level.enemies.length;
        this.enemiesDestroyed = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
    }

    public update(delta: number): void {
        if (this.isPaused || this.isGameOver) return;

        this.timeRemaining -= delta / 60; // Assuming 60 FPS
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.isGameOver = true;
            // Trigger Loss
        }
    }

    public onEnemyDestroyed(): void {
        this.enemiesRemaining--;
        this.enemiesDestroyed++;
        if (this.enemiesRemaining <= 0) {
            this.isGameOver = true;
            // Trigger Win
        }
    }

    public getStars(): number {
        const timeTaken = this.level.timeLimit - this.timeRemaining;
        if (timeTaken <= this.level.starThresholds['3']) return 3;
        if (timeTaken <= this.level.starThresholds['2']) return 2;
        return 1;
    }

    public addTime(seconds: number): void {
        this.timeRemaining += seconds;
    }
}
