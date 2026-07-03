import * as PIXI from 'pixi.js';
import { Enemy } from '../entities/Enemy';
import { AssetsLoader, ASSETS } from '../core/AssetsLoader';
import { SURVIVAL } from './SurvivalConfig';
import { getPlayfieldEntityScale, isPhoneViewport } from '../core/Viewport';

const EDGE_PADDING = 48;
const ALL_SIDES = ['top', 'bottom', 'left', 'right'] as const;
const PHONE_SIDES = ['top', 'bottom'] as const;
type SpawnSide = typeof ALL_SIDES[number];

export class EnemyManager extends PIXI.Container {
    private enemies: Enemy[] = [];

    public spawnWave(playWidth: number, playHeight: number, speedMultiplier: number, count: number): void {
        const sides = this.pickDiverseSides(count);

        for (let i = 0; i < count; i++) {
            const offset = 0.08 + Math.random() * 0.84;
            this.spawnAtSide(sides[i], offset, playWidth, playHeight, speedMultiplier);
        }
    }

    private getSpawnSides(): readonly SpawnSide[] {
        return isPhoneViewport() ? PHONE_SIDES : ALL_SIDES;
    }

    private pickDiverseSides(count: number): SpawnSide[] {
        const pool = [...this.getSpawnSides()];
        const shuffled = pool.sort(() => Math.random() - 0.5);
        const sides: SpawnSide[] = [];

        for (let i = 0; i < count; i++) {
            sides.push(shuffled[i % shuffled.length]);
        }

        return sides.sort(() => Math.random() - 0.5);
    }

    private spawnAtSide(
        side: SpawnSide,
        offset: number,
        playWidth: number,
        playHeight: number,
        speedMultiplier: number,
    ): Enemy | null {
        const assets = AssetsLoader.getInstance();
        const texture = assets.getTexture(ASSETS.ORC);
        const deathTexture = assets.getTexture(ASSETS.ORC_DEATH);

        const pos = this.getSpawnPosition(side, offset, playWidth, playHeight);
        const baseSpeed = SURVIVAL.BASE_ENEMY_SPEED + Math.random() * 24;

        const enemy = new Enemy(
            pos.x, pos.y,
            baseSpeed,
            texture, deathTexture,
            side, offset,
            getPlayfieldEntityScale(),
        );
        enemy.setEffectiveSpeed(baseSpeed * speedMultiplier);

        enemy.on('pointerdown', () => this.onEnemyClick(enemy));
        this.addChild(enemy);
        this.enemies.push(enemy);
        return enemy;
    }

    private getSpawnPosition(side: string, offset: number, w: number, h: number): { x: number; y: number } {
        const t = Math.max(0.05, Math.min(0.95, offset));
        switch (side) {
            case 'top': return { x: t * w, y: EDGE_PADDING };
            case 'bottom': return { x: t * w, y: h - EDGE_PADDING };
            case 'left': return { x: EDGE_PADDING, y: t * h };
            case 'right': return { x: w - EDGE_PADDING, y: t * h };
            default: return { x: t * w, y: EDGE_PADDING };
        }
    }

    public applySpeedMultiplier(multiplier: number): void {
        this.enemies.forEach(enemy => {
            enemy.setEffectiveSpeed(enemy.baseSpeed * multiplier);
        });
    }

    public getEnemyCount(): number {
        return this.enemies.length;
    }

    public getEnemyAtPoint(cx: number, cy: number, hitRadius: number): Enemy | null {
        let closest: Enemy | null = null;
        let bestDist = hitRadius;

        for (const enemy of this.enemies) {
            const dist = Math.hypot(enemy.x - cx, enemy.y - cy);
            if (dist < bestDist) {
                bestDist = dist;
                closest = enemy;
            }
        }

        return closest;
    }

    public getEnemiesInRadius(cx: number, cy: number, radius: number): Enemy[] {
        return this.enemies.filter(enemy => {
            const dx = enemy.x - cx;
            const dy = enemy.y - cy;
            return Math.hypot(dx, dy) <= radius;
        });
    }

    public resize(width: number, height: number): void {
        const displayScale = getPlayfieldEntityScale();
        this.enemies.forEach(enemy => {
            enemy.setDisplayScale(displayScale);
            const pos = this.getSpawnPosition(enemy.designSide, enemy.designOffset, width, height);
            enemy.x = pos.x;
            enemy.y = pos.y;
        });
    }

    private onEnemyClick(enemy: Enemy): void {
        this.emit('enemyClicked', enemy);
    }

    public destroyEnemy(enemy: Enemy): void {
        this.enemies = this.enemies.filter(e => e !== enemy);
        enemy.die();
    }

    public removeEnemyImmediate(enemy: Enemy): void {
        this.enemies = this.enemies.filter(e => e !== enemy);
        this.removeChild(enemy);
        enemy.destroy();
    }

    public update(delta: number, castleX: number, castleY: number, castleRadius: number): Enemy[] {
        const breached: Enemy[] = [];
        this.enemies.forEach(enemy => {
            if (enemy.update(delta, castleX, castleY, castleRadius)) {
                breached.push(enemy);
            }
        });
        return breached;
    }

    public clearEnemies(): void {
        this.enemies.forEach(enemy => {
            this.removeChild(enemy);
            enemy.destroy();
        });
        this.enemies = [];
    }
}