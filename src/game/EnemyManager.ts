import * as PIXI from 'pixi.js';
import { Enemy } from '../entities/Enemy';
import { EnemyConfig } from './LevelManager';
import { SoundManager } from '../core/SoundManager';

export class EnemyManager extends PIXI.Container {
    private enemies: Enemy[] = [];

    constructor() {
        super();
    }

    private designWidth = 800;
    private designHeight = 600;
    private currentScaleX = 1;
    private currentScaleY = 1;

    public spawnEnemies(configs: EnemyConfig[]): void {
        this.clearEnemies();
        // Load textures
        const texture = PIXI.Assets.get('orc');
        const deathTexture = PIXI.Assets.get('orc_death');

        // Update scale based on current screen size
        this.currentScaleX = window.innerWidth / this.designWidth;
        this.currentScaleY = window.innerHeight / this.designHeight;

        configs.forEach(config => {
            // Scale position
            const x = config.x * this.currentScaleX;
            const y = config.y * this.currentScaleY;

            const enemy = new Enemy(x, y, config.speed, texture, deathTexture);
            // Store original design position for resizing
            (enemy as any).designX = config.x;
            (enemy as any).designY = config.y;

            enemy.on('pointerdown', () => this.onEnemyClick(enemy));
            this.addChild(enemy);
            this.enemies.push(enemy);
        });
    }

    public resize(width: number, height: number): void {
        this.currentScaleX = width / this.designWidth;
        this.currentScaleY = height / this.designHeight;

        this.enemies.forEach(enemy => {
            if ((enemy as any).designX !== undefined) {
                enemy.x = (enemy as any).designX * this.currentScaleX;
                enemy.y = (enemy as any).designY * this.currentScaleY;
            }
        });
    }

    private onEnemyClick(enemy: Enemy): void {
        this.emit('enemyClicked', enemy);
    }

    public destroyEnemy(enemy: Enemy): void {
        // Remove from logical list immediately so it doesn't affect game state
        this.enemies = this.enemies.filter(e => e !== enemy);
        // Trigger death animation (which will remove it from display on complete)
        enemy.die();
    }

    public update(delta: number, bounds: { width: number, height: number }): void {
        this.enemies.forEach(enemy => enemy.update(delta, bounds));
    }

    public clearEnemies(): void {
        this.enemies.forEach(enemy => this.removeChild(enemy));
        this.enemies = [];
    }
}
