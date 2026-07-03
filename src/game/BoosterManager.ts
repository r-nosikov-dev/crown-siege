import * as PIXI from 'pixi.js';
import { GameBooster } from '../entities/GameBooster';
import { ShotgunPickup } from '../entities/ShotgunPickup';
import { RpgPickup } from '../entities/RpgPickup';
import { AkPickup } from '../entities/AkPickup';
import { MinigunPickup } from '../entities/MinigunPickup';
import { AssetsLoader, ASSETS } from '../core/AssetsLoader';

import { playBoosterCollectEffect } from '../effects/BoosterCollectEffect';
import { SURVIVAL } from './SurvivalConfig';

export type PickupType = 'slow' | 'shotgun' | 'rpg' | 'assault' | 'minigun';

const PICKUP_TYPES: PickupType[] = ['slow', 'shotgun', 'rpg', 'assault', 'minigun'];

function rollPickupType(): PickupType {
    return PICKUP_TYPES[Math.floor(Math.random() * PICKUP_TYPES.length)];
}

export class BoosterManager extends PIXI.Container {
    private pickup: GameBooster | null = null;
    private pickupType: PickupType | null = null;
    private collecting = false;
    private spawnTimer = 0;
    private nextSpawnIn: number = SURVIVAL.BOOSTER_FIRST_SPAWN;

    constructor() {
        super();
        this.eventMode = 'passive';
        this.sortableChildren = true;
    }

    public reset(): void {
        this.clear();
        this.spawnTimer = 0;
        this.nextSpawnIn = SURVIVAL.BOOSTER_FIRST_SPAWN;
    }

    public update(delta: number, bounds: { width: number; height: number }): void {
        if (this.collecting) return;

        if (!this.pickup) {
            this.spawnTimer += delta / 60;
            if (this.spawnTimer >= this.nextSpawnIn) {
                this.spawnTimer = 0;
                this.nextSpawnIn = SURVIVAL.BOOSTER_INTERVAL_MIN
                    + Math.random() * (SURVIVAL.BOOSTER_INTERVAL_MAX - SURVIVAL.BOOSTER_INTERVAL_MIN);
                this.spawnPickup(bounds);
            }
        }
    }

    private spawnPickup(bounds: { width: number; height: number }): void {
        const padding = 50;
        const spawnWidth = Math.max(80, bounds.width - padding * 2);
        const spawnHeight = Math.max(80, bounds.height - padding * 2);
        const x = padding + Math.random() * spawnWidth;
        const y = padding + Math.random() * spawnHeight;
        const type = rollPickupType();
        let pickup: GameBooster;
        if (type === 'shotgun') {
            pickup = new ShotgunPickup(x, y);
        } else if (type === 'rpg') {
            pickup = new RpgPickup(x, y);
        } else if (type === 'assault') {
            pickup = new AkPickup(x, y);
        } else if (type === 'minigun') {
            pickup = new MinigunPickup(x, y);
        } else {
            pickup = new GameBooster(x, y, AssetsLoader.getInstance().getTexture(ASSETS.BOOST));
        }

        pickup.zIndex = 10;
        pickup.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
            e.stopPropagation();
            this.collectPickup(pickup);
        });

        this.addChild(pickup);
        this.pickup = pickup;
        this.pickupType = type;
    }

    private collectPickup(pickup: GameBooster): void {
        if (this.collecting || this.pickup !== pickup || !this.pickupType) return;
        this.collecting = true;

        const scene = this.parent?.parent ?? this.parent;
        const type = this.pickupType;

        const finish = (): void => {
            this.finishCollect(pickup, type);
        };

        if (!scene) {
            finish();
            return;
        }

        const amount = type === 'slow'
            ? SURVIVAL.SLOW_DURATION
            : type === 'shotgun'
                ? SURVIVAL.SHOTGUN_AMMO
                : type === 'rpg'
                    ? SURVIVAL.RPG_AMMO
                    : 0;
        const suffix = type === 'slow'
            ? 'SLOW'
            : type === 'shotgun'
                ? 'SHOTGUN'
                : type === 'rpg'
                    ? 'RPG'
                    : type === 'minigun'
                        ? 'MINIGUN'
                        : 'AK';

        try {
            playBoosterCollectEffect(scene as PIXI.Container, pickup, amount, suffix, finish);
        } catch {
            finish();
        }
    }

    private finishCollect(pickup: GameBooster, type: PickupType): void {
        this.removePickup(pickup);
        this.collecting = false;
        this.spawnTimer = 0;
        this.emit('pickupCollected', type);
    }

    private removePickup(pickup: GameBooster): void {
        this.removeChild(pickup);
        pickup.destroy();
        if (this.pickup === pickup) {
            this.pickup = null;
            this.pickupType = null;
        }
    }

    public resize(width: number, height: number): void {
        if (!this.pickup) return;
        this.pickup.x = Math.min(Math.max(this.pickup.x, 30), width - 30);
        this.pickup.y = Math.min(Math.max(this.pickup.y, 30), height - 30);
    }

    public clear(): void {
        this.collecting = false;
        if (this.pickup) {
            this.removeChild(this.pickup);
            this.pickup.destroy();
            this.pickup = null;
            this.pickupType = null;
        }
    }
}