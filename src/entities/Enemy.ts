import * as PIXI from 'pixi.js';

export class Enemy extends PIXI.Container {
    private sprite: PIXI.AnimatedSprite;
    private speed: number;
    private direction: { x: number, y: number };
    private textures: { [key: string]: PIXI.Texture[] };
    private deathTextures: { [key: string]: PIXI.Texture[] };

    constructor(x: number, y: number, speed: number, texture: PIXI.Texture, deathTexture: PIXI.Texture) {
        super();
        this.x = x;
        this.y = y;
        this.speed = speed;

        this.processTextures(texture);
        this.processDeathTextures(deathTexture);
        this.createSprite();
        this.changeDirection(); // Initialize with a cardinal direction

        this.interactive = true;
        this.cursor = "url('assets/images/ui/aim.png') 16 16, auto";
    }

    private processTextures(baseTexture: PIXI.Texture): void {
        this.textures = {
            up: [],
            down: [],
            left: [],
            right: []
        };

        const frameWidth = 64;
        const frameHeight = 64;
        const rows = 4;
        const cols = 8;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const rect = new PIXI.Rectangle(col * frameWidth, row * frameHeight, frameWidth, frameHeight);
                const texture = new PIXI.Texture({ source: baseTexture.source, frame: rect });

                if (row === 0) this.textures.down.push(texture);
                else if (row === 1) this.textures.up.push(texture);
                else if (row === 2) this.textures.left.push(texture);
                else if (row === 3) this.textures.right.push(texture);
            }
        }
    }

    private processDeathTextures(baseTexture: PIXI.Texture): void {
        this.deathTextures = {
            up: [],
            down: [],
            left: [],
            right: []
        };

        const frameWidth = 64;
        const frameHeight = 64;
        const rows = 4;
        const cols = 8; // Assuming same layout

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const rect = new PIXI.Rectangle(col * frameWidth, row * frameHeight, frameWidth, frameHeight);

                const texture = new PIXI.Texture({ source: baseTexture.source, frame: rect });

                if (row === 0) this.deathTextures.down.push(texture);
                else if (row === 1) this.deathTextures.up.push(texture);
                else if (row === 2) this.deathTextures.left.push(texture);
                else if (row === 3) this.deathTextures.right.push(texture);
            }
        }
    }

    private createSprite(): void {
        this.sprite = new PIXI.AnimatedSprite(this.textures.down);
        this.sprite.anchor.set(0.5);
        this.sprite.animationSpeed = 0.15;
        this.sprite.play();
        this.addChild(this.sprite);
    }

    private changeDirection(): void {
        const directions = [
            { x: 0, y: -1, anim: 'up' },    // Up
            { x: 0, y: 1, anim: 'down' },   // Down
            { x: -1, y: 0, anim: 'left' },  // Left
            { x: 1, y: 0, anim: 'right' }   // Right
        ];

        const nextDir = directions[Math.floor(Math.random() * directions.length)];
        this.direction = { x: nextDir.x, y: nextDir.y };
        this.playAnimation(nextDir.anim);
    }

    public update(delta: number, bounds: { width: number, height: number }): void {
        if (!this.interactive) return; // Dead

        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;

        // Check bounds
        const padding = 32;
        let hitWall = false;

        if (this.x < padding) { this.x = padding; hitWall = true; }
        else if (this.x > bounds.width - padding) { this.x = bounds.width - padding; hitWall = true; }

        if (this.y < padding) { this.y = padding; hitWall = true; }
        else if (this.y > bounds.height - padding) { this.y = bounds.height - padding; hitWall = true; }

        // Change direction on wall hit or randomly (1% chance per frame)
        if (hitWall || Math.random() < 0.01) {
            this.changeDirection();
        }
    }

    private playAnimation(key: string): void {
        if (this.sprite.textures === this.textures[key]) return;
        this.sprite.textures = this.textures[key];
        this.sprite.play();
    }

    public die(): void {
        this.interactive = false;

        // Determine current animation key based on direction
        let key = 'down';
        if (this.direction.y < 0) key = 'up';
        else if (this.direction.y > 0) key = 'down';
        else if (this.direction.x < 0) key = 'left';
        else if (this.direction.x > 0) key = 'right';

        this.sprite.textures = this.deathTextures[key];
        this.sprite.loop = false;
        this.sprite.onComplete = () => {
            this.destroy(); // Remove from parent
        };
        this.sprite.play();
    }
}
