import * as PIXI from 'pixi.js';
import { AssetsLoader } from '../core/AssetsLoader';

type DirectionKey = 'up' | 'down' | 'left' | 'right';

export class Enemy extends PIXI.Container {
    public readonly designSide: string;
    public readonly designOffset: number;

    public readonly baseSpeed: number;

    private sprite: PIXI.AnimatedSprite;
    private speed: number;
    private textures: Record<DirectionKey, PIXI.Texture[]>;
    private deathTextures: Record<DirectionKey, PIXI.Texture[]>;
    private currentAnim: DirectionKey = 'down';
    private alive = true;

    private displayScale = 1;

    constructor(
        x: number,
        y: number,
        speed: number,
        texture: PIXI.Texture,
        deathTexture: PIXI.Texture,
        designSide: string,
        designOffset: number,
        displayScale = 1,
    ) {
        super();
        this.x = x;
        this.y = y;
        this.baseSpeed = speed;
        this.speed = speed;
        this.designSide = designSide;
        this.designOffset = designOffset;
        this.displayScale = displayScale;

        this.processTextures(texture);
        this.processDeathTextures(deathTexture);
        this.createSprite();

        this.eventMode = 'static';
        this.cursor = AssetsLoader.getInstance().getAimCursor();
    }

    private processTextures(baseTexture: PIXI.Texture): void {
        this.textures = { up: [], down: [], left: [], right: [] };

        const frameWidth = 64;
        const frameHeight = 64;

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 8; col++) {
                const rect = new PIXI.Rectangle(col * frameWidth, row * frameHeight, frameWidth, frameHeight);
                const frame = new PIXI.Texture({ source: baseTexture.source, frame: rect });

                if (row === 0) this.textures.down.push(frame);
                else if (row === 1) this.textures.up.push(frame);
                else if (row === 2) this.textures.left.push(frame);
                else if (row === 3) this.textures.right.push(frame);
            }
        }
    }

    private processDeathTextures(baseTexture: PIXI.Texture): void {
        this.deathTextures = { up: [], down: [], left: [], right: [] };

        const frameWidth = 64;
        const frameHeight = 64;

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 8; col++) {
                const rect = new PIXI.Rectangle(col * frameWidth, row * frameHeight, frameWidth, frameHeight);
                const frame = new PIXI.Texture({ source: baseTexture.source, frame: rect });

                if (row === 0) this.deathTextures.down.push(frame);
                else if (row === 1) this.deathTextures.up.push(frame);
                else if (row === 2) this.deathTextures.left.push(frame);
                else if (row === 3) this.deathTextures.right.push(frame);
            }
        }
    }

    private createSprite(): void {
        this.sprite = new PIXI.AnimatedSprite(this.textures.down);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(this.displayScale);
        this.sprite.animationSpeed = 0.15;
        this.sprite.play();
        this.addChild(this.sprite);
    }

    public setDisplayScale(scale: number): void {
        this.displayScale = scale;
        this.sprite.scale.set(scale);
    }

    private playAnimation(key: DirectionKey): void {
        if (this.currentAnim === key) return;
        this.currentAnim = key;
        this.sprite.textures = this.textures[key];
        this.sprite.play();
    }

    private updateFacing(dx: number, dy: number): void {
        if (Math.abs(dx) > Math.abs(dy)) {
            this.playAnimation(dx < 0 ? 'left' : 'right');
        } else {
            this.playAnimation(dy < 0 ? 'up' : 'down');
        }
    }

    public setEffectiveSpeed(speed: number): void {
        this.speed = speed;
    }

    public update(delta: number, castleX: number, castleY: number, castleRadius: number): boolean {
        if (!this.alive) return false;

        const dx = castleX - this.x;
        const dy = castleY - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= castleRadius + 12 * this.displayScale) {
            return true;
        }

        const step = this.speed * (delta / 60);
        const nx = dx / dist;
        const ny = dy / dist;

        this.x += nx * step;
        this.y += ny * step;
        this.updateFacing(dx, dy);

        return false;
    }

    public die(): void {
        this.alive = false;
        this.eventMode = 'none';

        const key = this.currentAnim;
        this.sprite.textures = this.deathTextures[key];
        this.sprite.loop = false;
        this.sprite.onComplete = () => {
            this.destroy();
        };
        this.sprite.play();
    }
}