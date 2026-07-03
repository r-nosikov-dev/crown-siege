import * as PIXI from 'pixi.js';
import gsap from '../lib/gsap';
import { castleHealStyle } from '../styles/GameTypography';

export function spawnCastleHealPopup(parent: PIXI.Container, x: number, y: number, amount: number): void {
    const text = new PIXI.Text({
        text: `+${amount} HP`,
        style: castleHealStyle(),
    });

    text.anchor.set(0.5);
    text.position.set(x, y);
    text.alpha = 0;
    text.scale.set(0.6);
    parent.addChild(text);

    const state = { y, alpha: 0, scale: 0.6 };

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
        .to(state, { alpha: 1, scale: 1.1, duration: 0.18, ease: 'back.out(2)' })
        .to(state, { y: y - 48, alpha: 0, scale: 0.95, duration: 0.85, ease: 'power2.out' }, '+=0.08');
}