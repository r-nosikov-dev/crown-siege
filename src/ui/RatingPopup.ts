import gsap from '../lib/gsap';
import { HighScore } from '../core/HighScore';
import { formatTime, RATING_THRESHOLDS } from '../game/SurvivalConfig';

export interface RatingPopupOptions {
    onClose: () => void;
}

function formatDate(timestamp: number): string {
    const d = new Date(timestamp);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
}

function buildLeaderboardRows(): string {
    const board = HighScore.getLeaderboard();
    if (board.length === 0) {
        return `
            <tr class="rating-popup__empty-row">
                <td colspan="6">No runs yet. Play to set your first score!</td>
            </tr>
        `;
    }

    return board.map((entry, index) => {
        const tierInfo = RATING_THRESHOLDS.find(r => r.tier === entry.tier);
        const color = tierInfo?.color ?? '#fff';
        return `
            <tr class="rating-popup__row${index === 0 ? ' rating-popup__row--best' : ''}">
                <td>${index + 1}</td>
                <td>${formatTime(entry.elapsed)}</td>
                <td style="color:${color}">${entry.tier}</td>
                <td>${entry.kills}</td>
                <td>${entry.score}</td>
                <td class="rating-popup__date">${formatDate(entry.date)}</td>
            </tr>
        `;
    }).join('');
}

function buildTierRows(): string {
    return RATING_THRESHOLDS.map(r => `
        <tr class="rating-popup__tier-row">
            <td style="color:${r.color}">${r.tier}</td>
            <td>${r.title}</td>
            <td>${r.seconds > 0 ? formatTime(r.seconds) + '+' : '< 0:45'}</td>
        </tr>
    `).join('');
}

export class RatingPopup {
    private overlay: HTMLDivElement;
    private keyHandler: ((e: KeyboardEvent) => void) | null = null;

    constructor(options: RatingPopupOptions) {
        this.overlay = document.createElement('div');
        this.overlay.className = 'rating-popup';
        this.overlay.innerHTML = `
            <div class="rating-popup__panel">
                <button class="rating-popup__close" type="button" aria-label="Close">×</button>
                <div class="rating-popup__header">RATING</div>
                <div class="rating-popup__scroll">
                    <div class="rating-popup__section-title">YOUR BEST RUNS</div>
                    <div class="rating-popup__table-wrap">
                        <table class="rating-popup__table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>TIME</th>
                                    <th>RANK</th>
                                    <th>KILLS</th>
                                    <th>SCORE</th>
                                    <th>DATE</th>
                                </tr>
                            </thead>
                            <tbody>${buildLeaderboardRows()}</tbody>
                        </table>
                    </div>
                    <div class="rating-popup__section-title rating-popup__section-title--tiers">RANK TIERS</div>
                    <div class="rating-popup__table-wrap">
                        <table class="rating-popup__table rating-popup__table--tiers">
                            <thead>
                                <tr>
                                    <th>RANK</th>
                                    <th>TITLE</th>
                                    <th>TIME</th>
                                </tr>
                            </thead>
                            <tbody>${buildTierRows()}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);
        this.bindEvents(options);
        this.animateIn();
    }

    private bindEvents(options: RatingPopupOptions): void {
        const close = (): void => {
            this.destroy();
            options.onClose();
        };

        this.overlay.querySelector('.rating-popup__close')?.addEventListener('click', close);
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) close();
        });

        this.keyHandler = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', this.keyHandler);
    }

    private animateIn(): void {
        const panel = this.overlay.querySelector('.rating-popup__panel') as HTMLElement;
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