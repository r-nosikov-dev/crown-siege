import * as PIXI from 'pixi.js';
import { GameBooster } from '../entities/GameBooster';
import { SoundManager } from '../core/SoundManager';

export class BoosterManager extends PIXI.Container {
    private boosters: GameBooster[] = [];
    private spawnTimer: number = 0;
    private spawnInterval: number = 8; // Spawn more frequently (every 8s)

    constructor() {
        super();
    }

    public update(delta: number, bounds: { width: number, height: number }): void {
        this.spawnTimer += delta * (1 / 60);
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            // High chance to spawn (80%)
            if (Math.random() > 0.2) {
                this.spawnBooster(bounds);
            }
        }
    }

    private spawnBooster(bounds: { width: number, height: number }): void {
        const padding = 60;
        const x = padding + Math.random() * (bounds.width - padding * 2);
        const y = padding + Math.random() * (bounds.height - padding * 2);

        const texture = PIXI.Assets.get('boost_collectible');
        if (!texture) return;

        const booster = new GameBooster(x, y, texture);
        booster.on('pointerdown', () => this.collectBooster(booster));

        this.addChild(booster);
        this.boosters.push(booster);

        // Optional: Auto-remove after some time if not collected
        setTimeout(() => {
            if (this.boosters.includes(booster)) {
                this.removeBooster(booster);
            }
        }, 7000); // Disappear after 7 seconds
    }

    private collectBooster(booster: GameBooster): void {
        // Sound removed as per user request
        this.removeBooster(booster);
        this.emit('boosterCollected', 10); // Give 10 seconds
    }

    private removeBooster(booster: GameBooster): void {
        this.removeChild(booster);
        this.boosters = this.boosters.filter(b => b !== booster);
    }

    public resize(width: number, height: number): void {
        this.boosters.forEach(b => {
            b.x = Math.min(Math.max(b.x, 30), width - 30);
            b.y = Math.min(Math.max(b.y, 30), height - 30);
        });
    }

    public clear(): void {
        this.boosters.forEach(b => this.removeChild(b));
        this.boosters = [];
        this.spawnTimer = 0;
    }
}
