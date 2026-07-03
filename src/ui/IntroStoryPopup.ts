import gsap from '../lib/gsap';
import { GAME_INTRO_BEGIN_LABEL, GAME_INTRO_LINES, GAME_INTRO_TITLE } from '../core/GameConfig';

export interface IntroStoryPopupOptions {
    onBegin: () => void;
    onCancel?: () => void;
}

export class IntroStoryPopup {
    private overlay: HTMLDivElement;
    private keyHandler: ((e: KeyboardEvent) => void) | null = null;

    constructor(options: IntroStoryPopupOptions) {
        const linesHtml = GAME_INTRO_LINES
            .map(line => `<p class="intro-popup__line">${line}</p>`)
            .join('');

        this.overlay = document.createElement('div');
        this.overlay.className = 'intro-popup';
        this.overlay.innerHTML = `
            <div class="intro-popup__panel">
                <div class="intro-popup__header">${GAME_INTRO_TITLE}</div>
                <div class="intro-popup__body">${linesHtml}</div>
                <button class="snes-button has-ember-color intro-popup__btn" type="button">
                    ${GAME_INTRO_BEGIN_LABEL}
                </button>
            </div>
        `;

        document.body.appendChild(this.overlay);
        this.bindEvents(options);
        this.animateIn();
    }

    private bindEvents(options: IntroStoryPopupOptions): void {
        const begin = (): void => {
            this.destroy();
            options.onBegin();
        };

        const cancel = (): void => {
            this.destroy();
            options.onCancel?.();
        };

        this.overlay.querySelector('.intro-popup__btn')?.addEventListener('click', begin);

        this.keyHandler = (e: KeyboardEvent): void => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                begin();
            } else if (e.key === 'Escape') {
                cancel();
            }
        };
        window.addEventListener('keydown', this.keyHandler);
    }

    private animateIn(): void {
        const panel = this.overlay.querySelector('.intro-popup__panel') as HTMLElement;
        const anim = { overlayAlpha: 0, panelScale: 0.92, panelY: 24 };

        const apply = (): void => {
            this.overlay.style.opacity = `${anim.overlayAlpha}`;
            panel.style.transform = `scale(${anim.panelScale}) translateY(${anim.panelY}px)`;
        };
        apply();

        gsap.timeline({ onUpdate: apply })
            .to(anim, { overlayAlpha: 1, duration: 0.3, ease: 'power2.out' })
            .to(anim, { panelScale: 1, panelY: 0, duration: 0.4, ease: 'back.out(1.4)' }, 0.06);
    }

    public destroy(): void {
        if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
        this.overlay.remove();
    }
}