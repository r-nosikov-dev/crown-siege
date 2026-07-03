import * as PIXI from 'pixi.js';

export function isPointInRect(x: number, y: number, rect: PIXI.Rectangle, margin = 0): boolean {
    return (
        x >= rect.x - margin &&
        x <= rect.x + rect.width + margin &&
        y >= rect.y - margin &&
        y <= rect.y + rect.height + margin
    );
}