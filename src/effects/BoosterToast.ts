import gsap from '../lib/gsap';

let activeToast: HTMLDivElement | null = null;

export function showBoosterToast(message: string, displayMs = 2200): void {
    if (activeToast) {
        activeToast.remove();
        activeToast = null;
    }

    const toast = document.createElement('div');
    toast.className = 'booster-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    activeToast = toast;

    const state = { opacity: 0, y: -8 };

    const apply = (): void => {
        toast.style.opacity = `${state.opacity}`;
        toast.style.transform = `translateX(-50%) translateY(${state.y}px)`;
    };
    apply();

    gsap.timeline({
        onUpdate: apply,
        onComplete: () => {
            gsap.to(state, {
                opacity: 0,
                y: -14,
                duration: 0.35,
                delay: displayMs / 1000,
                ease: 'power2.in',
                onUpdate: apply,
                onComplete: () => {
                    toast.remove();
                    if (activeToast === toast) activeToast = null;
                },
            });
        },
    })
        .to(state, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
}