import * as PIXI from 'pixi.js';
import gsap from '../lib/gsap';
import { getViewportSize } from '../core/Viewport';
import { ExplosionFlashFilter } from './ExplosionFlashFilter';

export class ExplosionFlashController {
    private readonly filter: ExplosionFlashFilter;
    private readonly colorMatrix: PIXI.ColorMatrixFilter;
    private readonly target: PIXI.Container;
    private tween: import('../lib/gsap').GsapTimeline | null = null;

    constructor(target: PIXI.Container) {
        this.target = target;
        this.filter = new ExplosionFlashFilter();
        this.colorMatrix = new PIXI.ColorMatrixFilter();
        target.filters = [this.filter, this.colorMatrix];
    }

    public trigger(screenX: number, screenY: number, blastRadius: number): void {
        const { width: w, height: h } = getViewportSize();
        const nx = screenX / w;
        const ny = screenY / h;
        const nr = blastRadius / Math.max(w, h);

        this.filter.setBlast(nx, ny, Math.max(nr, 0.08));
        this.filter.setFlash(0);

        if (this.tween) {
            this.tween.kill();
        }

        const state = { flash: 0, brightness: 1 };

        this.tween = gsap.timeline({
            onUpdate: () => {
                this.filter.setFlash(state.flash);
                this.colorMatrix.brightness(state.brightness, false);
            },
            onComplete: () => {
                this.filter.setFlash(0);
                this.colorMatrix.brightness(1, false);
                this.tween = null;
            },
        })
            .to(state, { flash: 1.35, brightness: 1.55, duration: 0.07, ease: 'power2.out' })
            .to(state, { flash: 0.85, brightness: 1.25, duration: 0.12, ease: 'sine.out' })
            .to(state, { flash: 0, brightness: 1, duration: 0.45, ease: 'power2.inOut' });
    }

    public destroy(): void {
        if (this.tween) this.tween.kill();
        this.target.filters = [];
        this.filter.destroy();
        this.colorMatrix.destroy();
    }
}