import * as PIXI from 'pixi.js';
import gsap from '../lib/gsap';
import { floatingScoreStyle } from '../styles/GameTypography';

const POINTS_PER_KILL = 100;

export function spawnFloatingScore(parent: PIXI.Container, x: number, y: number, points = POINTS_PER_KILL): void {
    const text = new PIXI.Text({
        text: `+${points}`,
        style: floatingScoreStyle(),
    });

    text.anchor.set(0.5);
    text.position.set(x, y);
    text.alpha = 0;
    text.scale.set(0.5);
    parent.addChild(text);

    const state = { y: y, alpha: 0, scale: 0.5 };

    gsap.timeline({
        onUpdate: () => {
            text.y = state.y;
            text.alpha = state.alpha;
            text.scale.set(state.scale);
        },
        onComplete: () => {
            parent.removeChild(text);
            text.destroy();
        },
    })
        .to(state, { alpha: 1, scale: 1.15, duration: 0.15, ease: 'back.out(2)' })
        .to(state, { y: y - 60, alpha: 0, scale: 0.9, duration: 0.9, ease: 'power2.out' }, '+=0.05');
}

export { POINTS_PER_KILL };