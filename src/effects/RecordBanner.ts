import gsap from '../lib/gsap';

let activeBanner: HTMLDivElement | null = null;

export function showRecordBanner(): void {
    if (activeBanner) return;

    const banner = document.createElement('div');
    banner.className = 'record-banner';
    banner.innerHTML = `
        <span class="record-banner__glow"></span>
        <span class="record-banner__text">NEW RECORD!</span>
        <span class="record-banner__sub">You beat your best time</span>
    `;
    document.body.appendChild(banner);
    activeBanner = banner;

    const state = { y: -120, opacity: 0, scale: 0.85 };

    const apply = (): void => {
        banner.style.transform = `translate(-50%, ${state.y}px) scale(${state.scale})`;
        banner.style.opacity = `${state.opacity}`;
    };

    gsap.timeline({
        onUpdate: apply,
        onComplete: () => {
            gsap.to(state, {
                y: -140,
                opacity: 0,
                duration: 0.5,
                delay: 1.2,
                ease: 'power2.in',
                onUpdate: apply,
                onComplete: () => {
                    banner.remove();
                    activeBanner = null;
                },
            });
        },
    })
        .to(state, { y: 24, opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.6)' })
        .to(state, { y: 16, duration: 0.2, ease: 'sine.out' });
}