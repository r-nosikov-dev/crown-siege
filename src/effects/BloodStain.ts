import * as PIXI from 'pixi.js';
import { AssetsLoader } from '../core/AssetsLoader';
import { isPointInRect } from './exclusion';

export function spawnBloodStain(
    parent: PIXI.Container,
    x: number,
    y: number,
    excludeRect?: PIXI.Rectangle,
): PIXI.Container | null {
    if (excludeRect && isPointInRect(x, y, excludeRect, 26)) return null;

    const stain = new PIXI.Container();
    stain.position.set(x, y);
    stain.rotation = Math.random() * Math.PI * 2;
    const scale = 0.75 + Math.random() * 0.65;
    stain.scale.set(scale);

    const sprite = new PIXI.Sprite(AssetsLoader.getInstance().getRandomBloodStainTexture());
    sprite.anchor.set(0.5);
    stain.addChild(sprite);

    parent.addChild(stain);
    return stain;
}

export function trimBloodStains(parent: PIXI.Container, maxCount: number): void {
    while (parent.children.length > maxCount) {
        const oldest = parent.children[0];
        parent.removeChild(oldest);
        oldest.destroy({ children: true });
    }
}