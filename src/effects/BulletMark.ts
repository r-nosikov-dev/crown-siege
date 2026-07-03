import * as PIXI from 'pixi.js';
import gsap from '../lib/gsap';
import { AssetsLoader } from '../core/AssetsLoader';
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
        const rotation = Math.random() * Math.PI * 2;
        spawnSingleMark(parent, x - BARREL_GAP * 0.5, y, excludeRect, rotation);
        spawnSingleMark(parent, x + BARREL_GAP * 0.5, y, excludeRect, rotation);
        return;
    }
    spawnSingleMark(parent, x, y, excludeRect);
}

function spawnSingleMark(
    parent: PIXI.Container,
    x: number,
    y: number,
    excludeRect?: PIXI.Rectangle,
    rotation = Math.random() * Math.PI * 2,
): void {
    if (excludeRect && isPointInRect(x, y, excludeRect, 8)) return;

    const mark = new PIXI.Container();
    mark.position.set(x, y);
    mark.rotation = rotation;
    parent.addChild(mark);

    const sprite = new PIXI.Sprite(AssetsLoader.getInstance().getRandomBulletMarkTexture());
    sprite.anchor.set(0.5);
    const scale = 0.85 + Math.random() * 0.25;
    sprite.scale.set(scale);
    mark.addChild(sprite);

    const spark = new PIXI.Graphics();
    spark.circle(0, 0, 6).fill({ color: 0xffdd88, alpha: 0.85 });
    spark.circle(0, 0, 3).fill({ color: 0xffffff, alpha: 0.95 });
    mark.addChild(spark);

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