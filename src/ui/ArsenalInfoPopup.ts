import * as PIXI from 'pixi.js';
import gsap from '../lib/gsap';
import { GameApp } from '../core/GameApp';
import { buildArsenalEntries, ArsenalEntry } from './MenuArsenalPanel';

export interface ArsenalInfoPopupOptions {
    onClose: () => void;
}

function accentHex(color: number): string {
    return `#${color.toString(16).padStart(6, '0')}`;
}

function textureToDataUrl(texture: PIXI.Texture): string {
    const renderer = GameApp.getInstance().app.renderer;
    const sprite = new PIXI.Sprite(texture);
    const canvas = renderer.extract.canvas(sprite);
    return canvas.toDataURL('image/png');
}

function buildCardHtml(entry: ArsenalEntry, iconUrl: string): string {
    const accent = accentHex(entry.accent);
    return `
        <div class="arsenal-info-popup__card" style="--accent:${accent}">
            <div class="arsenal-info-popup__icon-wrap">
                <img class="arsenal-info-popup__icon" src="${iconUrl}" alt="${entry.name}" />
            </div>
            <div class="arsenal-info-popup__name">${entry.name}</div>
            <div class="arsenal-info-popup__desc">${entry.description}</div>
        </div>
    `;
}

export class ArsenalInfoPopup {
    private overlay: HTMLDivElement;
    private keyHandler: ((e: KeyboardEvent) => void) | null = null;

    constructor(options: ArsenalInfoPopupOptions) {
        const entries = buildArsenalEntries();
        const cardsHtml = entries
            .map(entry => buildCardHtml(entry, textureToDataUrl(entry.texture)))
            .join('');

        this.overlay = document.createElement('div');
        this.overlay.className = 'arsenal-info-popup';
        this.overlay.innerHTML = `
            <div class="arsenal-info-popup__panel">
                <button class="arsenal-info-popup__close" type="button" aria-label="Close">×</button>
                <div class="arsenal-info-popup__header">WEAPONS & BONUSES</div>
                <div class="arsenal-info-popup__scroll">
                    <div class="arsenal-info-popup__grid">${cardsHtml}</div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);
        this.bindEvents(options);
        this.animateIn();
    }

    private bindEvents(options: ArsenalInfoPopupOptions): void {
        const close = (): void => {
            this.destroy();
            options.onClose();
        };

        this.overlay.querySelector('.arsenal-info-popup__close')?.addEventListener('click', close);
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) close();
        });

        this.keyHandler = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', this.keyHandler);
    }

    private animateIn(): void {
        const panel = this.overlay.querySelector('.arsenal-info-popup__panel') as HTMLElement;
        const anim = { overlayAlpha: 0, panelScale: 0.92, panelY: 16 };

        const apply = (): void => {
            this.overlay.style.opacity = `${anim.overlayAlpha}`;
            panel.style.transform = `scale(${anim.panelScale}) translateY(${anim.panelY}px)`;
        };
        apply();

        gsap.timeline({ onUpdate: apply })
            .to(anim, { overlayAlpha: 1, duration: 0.25, ease: 'power2.out' })
            .to(anim, { panelScale: 1, panelY: 0, duration: 0.35, ease: 'back.out(1.4)' }, 0.04);
    }

    public destroy(): void {
        if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
        this.overlay.remove();
    }
}