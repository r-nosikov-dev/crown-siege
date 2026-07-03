import * as PIXI from 'pixi.js';
import gsap from '../lib/gsap';

export function playRpgExplosion(
    parent: PIXI.Container,
    x: number,
    y: number,
    radius: number,
): void {
    const root = new PIXI.Container();
    root.position.set(x, y);
    parent.addChild(root);

    const scorch = new PIXI.Graphics();
    scorch.ellipse(0, 0, radius * 0.9, radius * 0.75).fill({ color: 0xf5f5f0, alpha: 0.92 });
    scorch.ellipse(0, 0, radius * 0.55, radius * 0.45).fill({ color: 0x2a1810, alpha: 0.55 });
    scorch.ellipse(0, 0, radius * 0.3, radius * 0.25).fill({ color: 0x1a1008, alpha: 0.7 });
    root.addChild(scorch);

    const shockwave = new PIXI.Graphics();
    shockwave.circle(0, 0, radius * 0.2).stroke({ color: 0xfff4cc, width: 4, alpha: 0.95 });
    root.addChild(shockwave);

    const core = new PIXI.Graphics();
    core.circle(0, 0, radius * 0.35).fill({ color: 0xffffff, alpha: 1 });
    core.circle(0, 0, radius * 0.55).fill({ color: 0xffee66, alpha: 0.85 });
    core.circle(0, 0, radius * 0.8).fill({ color: 0xff8800, alpha: 0.6 });
    root.addChild(core);

    const flames: PIXI.Graphics[] = [];
    for (let i = 0; i < 10; i++) {
        const f = new PIXI.Graphics();
        const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.3;
        const len = radius * (0.5 + Math.random() * 0.5);
        f.moveTo(0, 0)
            .lineTo(Math.cos(a) * len, Math.sin(a) * len)
            .stroke({
                color: i % 2 === 0 ? 0xff4400 : 0xffcc00,
                width: 3 + Math.random() * 4,
                alpha: 0.9,
                cap: 'round',
            });
        root.addChild(f);
        flames.push(f);
    }

    const sparks: PIXI.Graphics[] = [];
    for (let i = 0; i < 16; i++) {
        const s = new PIXI.Graphics();
        s.circle(0, 0, 2 + Math.random() * 2).fill({ color: 0xffffaa, alpha: 1 });
        root.addChild(s);
        sparks.push(s);
    }

    const state = {
        coreScale: 0.2,
        coreAlpha: 1,
        shockScale: 0.3,
        shockAlpha: 1,
        scorchAlpha: 1,
    };

    const sparkData = sparks.map((s, i) => ({
        gfx: s,
        angle: (Math.PI * 2 * i) / sparks.length,
        dist: radius * (0.6 + Math.random() * 0.8),
        alpha: 1,
    }));

    let blastDone = false;

    const syncBlast = (): void => {
        core.scale.set(state.coreScale);
        core.alpha = state.coreAlpha;
        shockwave.scale.set(state.shockScale);
        shockwave.alpha = state.shockAlpha;
        scorch.alpha = state.scorchAlpha;
        sparkData.forEach((sp) => {
            sp.gfx.x = Math.cos(sp.angle) * sp.dist * state.shockScale;
            sp.gfx.y = Math.sin(sp.angle) * sp.dist * state.shockScale;
            sp.gfx.alpha = sp.alpha;
        });
        flames.forEach((f) => { f.alpha = state.coreAlpha * 0.85; });
    };

    const syncScorch = (): void => {
        scorch.alpha = state.scorchAlpha;
    };

    const clearBlastFx = (): void => {
        blastDone = true;
        core.destroy();
        shockwave.destroy();
        flames.forEach(f => f.destroy());
        sparks.forEach(s => s.destroy());
        state.scorchAlpha = 0.88;
        syncScorch();
    };

    const removeRoot = (): void => {
        parent.removeChild(root);
        root.destroy({ children: true });
    };

    gsap.timeline({ onUpdate: () => { if (!blastDone) syncBlast(); else syncScorch(); } })
        .to(state, { coreScale: 1.8, shockScale: 2.4, duration: 0.18, ease: 'power3.out' })
        .to(state, { coreAlpha: 0, shockAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.08)
        .to(sparkData, {
            alpha: 0,
            duration: 0.4,
            ease: 'power1.in',
            stagger: 0.01,
        }, 0.05)
        .to(state, { scorchAlpha: 0.88, duration: 0.55, ease: 'none', onStart: clearBlastFx })
        .to(state, { scorchAlpha: 0, duration: 1.4, ease: 'power1.in', onComplete: removeRoot });
}