import levelData from '../assets/config/levels.json';

export interface EnemyConfig {
    x: number;
    y: number;
    speed: number;
}

export interface LevelConfig {
    id: number;
    timeLimit: number;
    starThresholds: { [key: string]: number };
    enemies: EnemyConfig[];
}

export class LevelManager {
    private levels: LevelConfig[];

    constructor() {
        this.levels = levelData.levels;
    }

    public getLevel(id: number): LevelConfig | undefined {
        return this.levels.find(l => l.id === id);
    }

    public getTotalLevels(): number {
        return this.levels.length;
    }
}
