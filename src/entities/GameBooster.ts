import * as PIXI from 'pixi.js';

export class GameBooster extends PIXI.Sprite {
    private pulsePhase = 0;
    public readonly baseScale: number;
    private pulsing = true;

    constructor(x: number, y: number, texture: PIXI.Texture) {
        super(texture);
        this.anchor.set(0.5);
        this.x = x;
        this.y = y;
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.zIndex = 10;

        const targetSize = 72;
        this.baseScale = targetSize / Math.max(texture.width, texture.height);
        this.scale.set(this.baseScale);

        PIXI.Ticker.shared.add(this.onTick, this);
    }

    private onTick = (ticker: PIXI.Ticker): void => {
        if (!this.pulsing) return;
        this.pulsePhase += ticker.deltaTime * 0.06;
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.12;
        this.scale.set(this.baseScale * pulse);
    };

    public stopPulse(): void {
        this.pulsing = false;
        PIXI.Ticker.shared.remove(this.onTick, this);
    }

    public destroy(options?: PIXI.DestroyOptions): void {
        this.stopPulse();
        super.destroy(options);
    }
}