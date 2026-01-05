import * as PIXI from 'pixi.js';

export class GameBooster extends PIXI.Sprite {
    constructor(x: number, y: number, texture: PIXI.Texture) {
        super(texture);
        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.interactive = true;
        this.cursor = 'pointer';

        // Ensure it fits reasonably (boost.png might be small)
        this.scale.set(1.5);
    }
}
