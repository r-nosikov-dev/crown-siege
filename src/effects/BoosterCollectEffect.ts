import * as PIXI from 'pixi.js';
import gsap from '../lib/gsap';
import { GameBooster } from '../entities/GameBooster';
import { boosterCollectStyle } from '../styles/GameTypography';

const PARTICLE_COUNT = 8;

export function playBoosterCollectEffect(
    parent: PIXI.Container,
    booster: GameBooster,
    amount: number,
    suffix: string,
    onComplete: () => void,
): void {
    booster.stopPulse();
    booster.eventMode = 'none';

    const global = booster.getGlobalPosition();
    const local = parent.toLocal(global);
    const x = local.x;
    const y = local.y;

    const ring = new PIXI.Graphics();
    ring.circle(0, 0, 24).stroke({ color: 0x44ffee, width: 4, alpha: 0.95 });
    ring.circle(0, 0, 14).stroke({ color: 0xffdd44, width: 2, alpha: 0.8 });
    ring.position.set(x, y);
    parent.addChild(ring);

    const labelText = suffix === 'SLOW'
        ? `SLOW ${amount}s`
        : suffix === 'SHOTGUN'
            ? `SG x${amount}`
            : suffix === 'RPG'
                ? `RPG x${amount}`
                : suffix === 'AK'
                    ? 'AK-47'
                    : `+${amount} ${suffix}`;

    const label = new PIXI.Text({
        text: labelText,
        style: boosterCollectStyle(suffix),
    });
    label.anchor.set(0.5);
    label.position.set(x, y);
    label.alpha = 0;
    label.scale.set(0.4);
    parent.addChild(label);

    const particles: PIXI.Graphics[] = [];
    const particleStates = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        gfx: (() => {
            const p = new PIXI.Graphics();
            p.circle(0, 0, 3 + (i % 2)).fill(i % 2 === 0 ? 0x44ffee : 0xffdd44);
            p.position.set(x, y);
            p.alpha = 1;
            parent.addChild(p);
            particles.push(p);
            return p;
        })(),
        x,
        y,
        alpha: 1,
        angle: (Math.PI * 2 * i) / PARTICLE_COUNT,
    }));

    const boosterState = {
        scale: booster.scale.x,
        rotation: booster.rotation,
        alpha: booster.alpha,
    };
    const ringState = { scale: 0.4, alpha: 1 };
    const labelState = { y, alpha: 0, scale: 0.4 };

    const sync = (): void => {
        booster.scale.set(boosterState.scale);
        booster.rotation = boosterState.rotation;
        booster.alpha = boosterState.alpha;
        ring.scale.set(ringState.scale);
        ring.alpha = ringState.alpha;
        label.y = labelState.y;
        label.alpha = labelState.alpha;
        label.scale.set(labelState.scale);

        particleStates.forEach((p) => {
            p.gfx.x = p.x;
            p.gfx.y = p.y;
            p.gfx.alpha = p.alpha;
        });
    };

    const baseScale = booster.baseScale;

    gsap.timeline({
        onUpdate: sync,
        onComplete: () => {
            particles.forEach(p => {
                parent.removeChild(p);
                p.destroy();
            });
            parent.removeChild(ring);
            ring.destroy();
            parent.removeChild(label);
            label.destroy();
            onComplete();
        },
    })
        .to(boosterState, { scale: baseScale * 1.6, duration: 0.12, ease: 'back.out(3)' })
        .to(boosterState, {
            scale: 0,
            rotation: Math.PI * 2,
            alpha: 0,
            duration: 0.4,
            ease: 'power3.in',
        }, 0.1)
        .to(ringState, { scale: 2.8, alpha: 0, duration: 0.55, ease: 'power2.out' }, 0.05)
        .to(labelState, { alpha: 1, scale: 1.25, duration: 0.18, ease: 'back.out(2)' }, 0.12)
        .to(labelState, { y: y - 72, alpha: 0, scale: 0.95, duration: 0.75, ease: 'power2.out' }, 0.3);

    particleStates.forEach((p, i) => {
        const dist = 36 + (i % 3) * 8;
        gsap.to(p, {
            x: x + Math.cos(p.angle) * dist,
            y: y + Math.sin(p.angle) * dist,
            alpha: 0,
            duration: 0.45 + i * 0.02,
            ease: 'power2.out',
            delay: 0.08,
            onUpdate: sync,
        });
    });
}