import gsap from '../lib/gsap';
import { GAME_INTRO_BEGIN_LABEL, GAME_INTRO_LINES, GAME_INTRO_TITLE } from '../core/GameConfig';

export interface IntroStoryPopupOptions {
    onBegin: () => void;
    onCancel?: () => void;
}

const BASE_CHAR_MS = 34;
const LINE_PAUSE_MS = 520;
const HEADER_CHAR_MS = 28;

export class IntroStoryPopup {
    private overlay: HTMLDivElement;
    private beginBtn: HTMLButtonElement;
    private keyHandler: ((e: KeyboardEvent) => void) | null = null;
    private panelClickHandler: ((e: Event) => void) | null = null;
    private destroyed = false;
    private skipTyping = false;
    private timers: number[] = [];

    constructor(options: IntroStoryPopupOptions) {
        const linesHtml = GAME_INTRO_LINES
            .map((_, index) => `<p class="intro-popup__line" data-line="${index}"></p>`)
            .join('');

        this.overlay = document.createElement('div');
        this.overlay.className = 'intro-popup';
        this.overlay.innerHTML = `
            <div class="intro-popup__panel">
                <div class="intro-popup__header" data-intro-header></div>
                <div class="intro-popup__body">${linesHtml}</div>
                <button class="snes-button has-ember-color intro-popup__btn" type="button">
                    ${GAME_INTRO_BEGIN_LABEL}
                </button>
            </div>
        `;

        this.beginBtn = this.overlay.querySelector('.intro-popup__btn') as HTMLButtonElement;
        document.body.appendChild(this.overlay);
        this.bindEvents(options);
        void this.animateIn().then(() => this.runTypewriter());
    }

    private bindEvents(options: IntroStoryPopupOptions): void {
        const begin = (): void => {
            if (this.destroyed) return;
            this.destroy();
            options.onBegin();
        };

        const cancel = (): void => {
            this.destroy();
            options.onCancel?.();
        };

        const skipTyping = (): void => {
            if (this.skipTyping) return;
            this.skipTyping = true;
            this.finishTypingInstantly();
        };

        this.beginBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            begin();
        });

        const panel = this.overlay.querySelector('.intro-popup__panel') as HTMLElement;
        this.panelClickHandler = (e: Event) => {
            if ((e.target as HTMLElement).closest('.intro-popup__btn')) return;
            skipTyping();
        };
        panel.addEventListener('click', this.panelClickHandler);

        this.keyHandler = (e: KeyboardEvent): void => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                skipTyping();
            } else if (e.key === 'Escape') {
                cancel();
            }
        };
        window.addEventListener('keydown', this.keyHandler);
    }

    private charDelay(char: string): number {
        if (char === '.' || char === '—' || char === '!') return BASE_CHAR_MS * 7;
        if (char === ',') return BASE_CHAR_MS * 3;
        if (char === ' ') return BASE_CHAR_MS * 0.45;
        return BASE_CHAR_MS + Math.floor(Math.random() * 14);
    }

    private delay(ms: number): Promise<void> {
        if (this.destroyed || this.skipTyping) return Promise.resolve();
        return new Promise(resolve => {
            const id = window.setTimeout(resolve, ms);
            this.timers.push(id);
        });
    }

    private setActiveLine(index: number): void {
        this.overlay.querySelectorAll('.intro-popup__line').forEach((node, i) => {
            node.classList.toggle('intro-popup__line--active', i === index);
            node.classList.toggle('intro-popup__line--done', i < index);
        });
    }

    private async typeInto(element: HTMLElement, text: string, delayFn: (char: string) => number): Promise<void> {
        for (let i = 0; i <= text.length; i++) {
            if (this.destroyed || this.skipTyping) return;
            element.textContent = text.slice(0, i);
            if (i < text.length) {
                await this.delay(delayFn(text[i]));
            }
        }
    }

    private async runTypewriter(): Promise<void> {
        const header = this.overlay.querySelector('[data-intro-header]') as HTMLElement;
        const lineElements = [...this.overlay.querySelectorAll('.intro-popup__line')] as HTMLElement[];

        header.classList.add('intro-popup__header--typing');
        await this.typeInto(header, GAME_INTRO_TITLE, () => HEADER_CHAR_MS);
        header.classList.remove('intro-popup__header--typing');
        header.classList.add('intro-popup__header--done');
        await this.delay(280);

        for (let index = 0; index < GAME_INTRO_LINES.length; index++) {
            if (this.destroyed || this.skipTyping) break;

            const line = GAME_INTRO_LINES[index];
            const element = lineElements[index];
            this.setActiveLine(index);
            await this.typeInto(element, line, char => this.charDelay(char));
            element.classList.add('intro-popup__line--done');
            element.classList.remove('intro-popup__line--active');

            if (index < GAME_INTRO_LINES.length - 1) {
                await this.delay(LINE_PAUSE_MS);
            }
        }
    }

    private finishTypingInstantly(): void {
        const header = this.overlay.querySelector('[data-intro-header]') as HTMLElement;
        const lineElements = [...this.overlay.querySelectorAll('.intro-popup__line')] as HTMLElement[];

        header.textContent = GAME_INTRO_TITLE;
        header.classList.remove('intro-popup__header--typing');
        header.classList.add('intro-popup__header--done');

        GAME_INTRO_LINES.forEach((line, index) => {
            lineElements[index].textContent = line;
            lineElements[index].classList.add('intro-popup__line--done');
            lineElements[index].classList.remove('intro-popup__line--active');
        });
    }

    private async animateIn(): Promise<void> {
        const panel = this.overlay.querySelector('.intro-popup__panel') as HTMLElement;
        const anim = { overlayAlpha: 0, panelScale: 0.92, panelY: 24 };

        const apply = (): void => {
            this.overlay.style.opacity = `${anim.overlayAlpha}`;
            panel.style.transform = `scale(${anim.panelScale}) translateY(${anim.panelY}px)`;
        };
        apply();

        await new Promise<void>(resolve => {
            gsap.timeline({
                onUpdate: apply,
                onComplete: resolve,
            })
                .to(anim, { overlayAlpha: 1, duration: 0.3, ease: 'power2.out' })
                .to(anim, { panelScale: 1, panelY: 0, duration: 0.4, ease: 'back.out(1.4)' }, 0.06);
        });
    }

    public destroy(): void {
        this.destroyed = true;
        this.skipTyping = true;
        this.timers.forEach(id => window.clearTimeout(id));
        this.timers = [];
        if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
        if (this.panelClickHandler) {
            this.overlay.querySelector('.intro-popup__panel')?.removeEventListener('click', this.panelClickHandler);
        }
        this.overlay.remove();
    }
}