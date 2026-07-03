import * as PIXI from 'pixi.js';
import { getPlayfieldEntityScale } from '../core/Viewport';
import { castleHpStyle, castleMissionStyle } from '../styles/GameTypography';
import gsap, { GsapTimeline } from '../lib/gsap';

export class Castle extends PIXI.Container {
    private shadow: PIXI.Graphics;
    private sprite: PIXI.Sprite;
    private missionLabel: PIXI.Text;
    private hpBarBg: PIXI.Graphics;
    private hpBarFill: PIXI.Graphics;
    private hpText: PIXI.Text;
    private readonly baseDisplaySize = 96;
    private readonly textureMaxDim: number;
    private displaySize = 96;
    private barWidth = 88;
    private barHeight = 8;
    private lastHp = 100;
    private lastMax = 100;
    private homeX = 0;
    private homeY = 0;
    private shakeTimeline: GsapTimeline | null = null;

    constructor(texture: PIXI.Texture) {
        super();

        this.hpBarBg = new PIXI.Graphics();
        this.hpBarFill = new PIXI.Graphics();
        this.hpText = new PIXI.Text({
            text: '100',
            style: castleHpStyle(),
        });
        this.hpText.anchor.set(0.5);

        this.missionLabel = new PIXI.Text({
            text: 'PROTECT THE\nPRINCESS!',
            style: castleMissionStyle(),
        });
        this.missionLabel.anchor.set(0.5, 1);

        this.textureMaxDim = Math.max(texture.width, texture.height);
        this.shadow = new PIXI.Graphics();
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.applyEntityScale(getPlayfieldEntityScale());

        this.addChild(this.shadow, this.hpBarBg, this.hpBarFill, this.hpText, this.missionLabel, this.sprite);
        this.eventMode = 'none';
    }

    private applyEntityScale(entityScale: number): void {
        this.displaySize = this.baseDisplaySize * entityScale;
        this.sprite.scale.set(this.displaySize / this.textureMaxDim);
        this.drawShadow();
    }

    private drawShadow(): void {
        this.shadow.clear();
        const shadowW = this.displaySize * 0.78;
        const shadowH = this.displaySize * 0.24;
        const shadowY = this.displaySize * 0.4;
        this.shadow.ellipse(0, shadowY, shadowW, shadowH)
            .fill({ color: 0x000000, alpha: 0.32 });
        this.shadow.ellipse(0, shadowY, shadowW * 0.82, shadowH * 0.72)
            .fill({ color: 0x000000, alpha: 0.18 });
    }

    public layout(playWidth: number, playHeight: number): void {
        this.stopShake();
        const entityScale = getPlayfieldEntityScale();
        this.applyEntityScale(entityScale);
        this.homeX = playWidth / 2;
        this.homeY = playHeight / 2;
        this.position.set(this.homeX, this.homeY);

        const fontSize = entityScale < 0.58
            ? 5
            : entityScale < 0.72
                ? 6
                : playWidth < 480
                    ? 7
                    : playWidth < 720
                        ? 8
                        : 10;
        this.missionLabel.style.fontSize = fontSize;
        this.missionLabel.style.lineHeight = fontSize + 5;

        this.barWidth = Math.round(this.displaySize * (entityScale < 0.58 ? 0.82 : playWidth < 480 ? 0.78 : 0.92));
        this.barHeight = entityScale < 0.58 ? 4 : entityScale < 0.72 ? 5 : playWidth < 480 ? 6 : 8;
        this.hpText.style.fontSize = entityScale < 0.58 ? 4 : entityScale < 0.72 ? 5 : playWidth < 480 ? 6 : 7;

        const labelGap = Math.round(10 * entityScale);
        const topOffset = Math.round(14 * entityScale);
        const topY = -this.displaySize / 2 - topOffset;
        this.missionLabel.position.set(0, topY);
        this.positionHpBar(topY - this.missionLabel.height - labelGap);
        this.updateHp(this.lastHp, this.lastMax);
    }

    private positionHpBar(y: number): void {
        const halfW = this.barWidth / 2;
        const halfH = this.barHeight / 2;

        this.hpBarBg.clear();
        this.hpBarBg.roundRect(-halfW, y - halfH, this.barWidth, this.barHeight, 3)
            .fill({ color: 0x1a1020, alpha: 0.9 });
        this.hpBarBg.roundRect(-halfW, y - halfH, this.barWidth, this.barHeight, 3)
            .stroke({ color: 0x000000, width: 1.5, alpha: 0.8 });

        this.hpText.position.set(0, y);
    }

    public updateHp(hp: number, max: number): void {
        this.lastHp = hp;
        this.lastMax = max;
        const ratio = Math.max(0, Math.min(1, hp / max));
        const halfW = this.barWidth / 2;
        const y = this.hpText.y;
        const halfH = this.barHeight / 2;
        const fillW = Math.max(0, (this.barWidth - 4) * ratio);

        let fillColor = 0x51cf66;
        if (ratio <= 0.25) fillColor = 0xff4444;
        else if (ratio <= 0.5) fillColor = 0xffaa33;

        this.hpBarFill.clear();
        if (fillW > 0) {
            this.hpBarFill.roundRect(-halfW + 2, y - halfH + 2, fillW, this.barHeight - 4, 2)
                .fill({ color: fillColor, alpha: 0.95 });
        }

        this.hpText.text = `${Math.ceil(hp)}`;
        this.hpText.style.fill = ratio <= 0.25 ? 0xff8888 : 0xffffff;
    }

    public getHitRadius(): number {
        return this.displaySize * 0.38;
    }

    public shake(): void {
        this.stopShake();

        const entityScale = this.displaySize / this.baseDisplaySize;
        const intensity = 7 * entityScale;
        const state = { x: 0, y: 0 };

        this.shakeTimeline = gsap.timeline({
            onUpdate: () => this.position.set(this.homeX + state.x, this.homeY + state.y),
            onComplete: () => {
                this.position.set(this.homeX, this.homeY);
                this.shakeTimeline = null;
            },
        });

        this.shakeTimeline
            .to(state, { x: -intensity, y: intensity * 0.55, duration: 0.045, ease: 'power2.out' })
            .to(state, { x: intensity * 0.9, y: -intensity * 0.45, duration: 0.045 })
            .to(state, { x: -intensity * 0.65, y: intensity * 0.35, duration: 0.04 })
            .to(state, { x: intensity * 0.45, y: -intensity * 0.25, duration: 0.04 })
            .to(state, { x: -intensity * 0.2, y: intensity * 0.1, duration: 0.035 })
            .to(state, { x: 0, y: 0, duration: 0.06, ease: 'power2.out' });
    }

    private stopShake(): void {
        this.shakeTimeline?.kill();
        this.shakeTimeline = null;
        this.position.set(this.homeX, this.homeY);
    }

    public override destroy(options?: PIXI.DestroyOptions): void {
        this.stopShake();
        super.destroy(options);
    }

    /** Play-layer bounds used to skip blood and bullet decals on the castle. */
    public getEffectsExclusionRect(padding = 14): PIXI.Rectangle {
        const entityScale = this.displaySize / this.baseDisplaySize;
        const scaledPadding = padding * entityScale;
        const halfSprite = this.displaySize / 2;
        const topY = -halfSprite - Math.round(14 * entityScale);
        const hpBarY = topY - this.missionLabel.height - Math.round(10 * entityScale);
        const top = hpBarY - this.barHeight / 2 - scaledPadding;
        const bottom = halfSprite + scaledPadding;
        const halfW = Math.max(this.barWidth / 2, halfSprite) + scaledPadding;

        return new PIXI.Rectangle(
            this.x - halfW,
            this.y + top,
            halfW * 2,
            bottom - top,
        );
    }
}