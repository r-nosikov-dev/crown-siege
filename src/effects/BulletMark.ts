import * as PIXI from 'pixi.js';
import gsap from '../lib/gsap';
import { isPointInRect } from './exclusion';

const MARK_LIFETIME = 1.8;
const BARREL_GAP = 11;

export interface BulletMarkOptions {
    double?: boolean;
    excludeRect?: PIXI.Rectangle;
}

export function spawnBulletMark(
    parent: PIXI.Container,
    x: number,
    y: number,
    options?: BulletMarkOptions,
): void {
    const excludeRect = options?.excludeRect;
    if (options?.double) {
        const spread = 0.35 + Math.random() * 0.2;
        spawnSingleMark(parent, x - BARREL_GAP * 0.5, y, spread, excludeRect);
        spawnSingleMark(parent, x + BARREL_GAP * 0.5, y, -spread, excludeRect);
        return;
    }
    spawnSingleMark(parent, x, y, 0, excludeRect);
}

function spawnSingleMark(
    parent: PIXI.Container,
    x: number,
    y: number,
    angleBias: number,
    excludeRect?: PIXI.Rectangle,
): void {
    if (excludeRect && isPointInRect(x, y, excludeRect, 8)) return;

    const mark = new PIXI.Container();
    mark.position.set(x, y);
    parent.addChild(mark);

    const angle = -Math.PI / 2 + angleBias + (Math.random() - 0.5) * 0.4;
    const trailLen = 10 + Math.random() * 8;

    const trail = new PIXI.Graphics();
    trail.moveTo(0, 0)
        .lineTo(Math.cos(angle) * trailLen, Math.sin(angle) * trailLen)
        .stroke({ color: 0x9a8a60, width: 2, alpha: 0.75 });
    trail.moveTo(0, 0)
        .lineTo(Math.cos(angle + 0.35) * (trailLen * 0.55), Math.sin(angle + 0.35) * (trailLen * 0.55))
        .stroke({ color: 0x6a5a40, width: 1, alpha: 0.5 });
    mark.addChild(trail);

    const hole = new PIXI.Graphics();
    hole.circle(0, 0, 2.5).fill({ color: 0x15120e, alpha: 0.9 });
    hole.circle(0, 0, 5).stroke({ color: 0x4a4030, width: 1.2, alpha: 0.7 });
    hole.circle(0, 0, 8).stroke({ color: 0x7a6a50, width: 0.8, alpha: 0.35 });
    mark.addChild(hole);

    const spark = new PIXI.Graphics();
    spark.circle(0, 0, 6).fill({ color: 0xffdd88, alpha: 0.85 });
    spark.circle(0, 0, 3).fill({ color: 0xffffff, alpha: 0.95 });
    mark.addChild(spark);

    for (let i = 0; i < 4; i++) {
        const d = new PIXI.Graphics();
        const a = angle + (Math.random() - 0.5) * 1.2;
        const len = 4 + Math.random() * 6;
        d.moveTo(0, 0).lineTo(Math.cos(a) * len, Math.sin(a) * len)
            .stroke({ color: 0xc4b48a, width: 1, alpha: 0.6 });
        mark.addChild(d);
    }

    const state = { sparkAlpha: 1, sparkScale: 1.4, markAlpha: 1 };

    const sync = (): void => {
        spark.alpha = state.sparkAlpha;
        spark.scale.set(state.sparkScale);
        mark.alpha = state.markAlpha;
    };

    gsap.timeline({
        onUpdate: sync,
        onComplete: () => {
            parent.removeChild(mark);
            mark.destroy({ children: true });
        },
    })
        .to(state, { sparkAlpha: 0, sparkScale: 2.2, duration: 0.12, ease: 'power2.out' })
        .to(state, { markAlpha: 0, duration: MARK_LIFETIME, ease: 'power1.in' }, 0.25);
}