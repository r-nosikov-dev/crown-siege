import * as PIXI from 'pixi.js';
import gsap from '../lib/gsap';
import { formatTime } from '../game/SurvivalConfig';

export interface ResultData {
    elapsed: number;
    kills: number;
    score: number;
    tier: string;
    tierColor: string;
    tierTitle: string;
    bestTime: number;
    isNewRecord: boolean;
}

export class ResultPopup extends PIXI.Container {
    private overlay: HTMLDivElement;

    constructor(data: ResultData, onRetry: () => void, onMenu: () => void) {
        super();

        this.overlay = document.createElement('div');
        this.overlay.className = 'result-popup';
        this.overlay.innerHTML = `
            <div class="result-popup__panel">
                <div class="result-popup__header">DEFEAT</div>
                ${data.isNewRecord ? '<div class="result-popup__record">NEW RECORD</div>' : ''}
                <div class="result-popup__rating" style="color:${data.tierColor}">
                    <span class="result-popup__tier">${data.tier}</span>
                    <span class="result-popup__tier-title">${data.tierTitle}</span>
                </div>
                <div class="result-popup__stats">
                    <div class="result-popup__stat">
                        <span class="result-popup__stat-label">SURVIVED</span>
                        <span class="result-popup__stat-value">${formatTime(data.elapsed)}</span>
                    </div>
                    <div class="result-popup__stat">
                        <span class="result-popup__stat-label">KILLS</span>
                        <span class="result-popup__stat-value">${data.kills}</span>
                    </div>
                    <div class="result-popup__stat">
                        <span class="result-popup__stat-label">SCORE</span>
                        <span class="result-popup__stat-value">${data.score}</span>
                    </div>
                    <div class="result-popup__stat">
                        <span class="result-popup__stat-label">BEST</span>
                        <span class="result-popup__stat-value">${formatTime(data.bestTime)}</span>
                    </div>
                </div>
                <div class="result-popup__actions">
                    <button class="snes-button has-ocean-color result-popup__btn" data-action="retry">TRY AGAIN</button>
                    <button class="snes-button result-popup__btn" data-action="menu">MENU</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        const panel = this.overlay.querySelector('.result-popup__panel') as HTMLElement;
        const anim = { overlayAlpha: 0, panelScale: 0.88, panelY: 30 };

        const apply = (): void => {
            this.overlay.style.opacity = `${anim.overlayAlpha}`;
            panel.style.transform = `scale(${anim.panelScale}) translateY(${anim.panelY}px)`;
        };
        apply();

        gsap.timeline({ onUpdate: apply })
            .to(anim, { overlayAlpha: 1, duration: 0.35, ease: 'power2.out' })
            .to(anim, { panelScale: 1, panelY: 0, duration: 0.5, ease: 'back.out(1.4)' }, 0.05);

        this.overlay.querySelector('[data-action="retry"]')?.addEventListener('click', () => {
            this.destroy();
            onRetry();
        });
        this.overlay.querySelector('[data-action="menu"]')?.addEventListener('click', () => {
            this.destroy();
            onMenu();
        });
    }

    public destroy(options?: PIXI.DestroyOptions): void {
        this.overlay?.remove();
        super.destroy(options);
    }
}