import gsap from '../lib/gsap';
import { SoundManager } from '../core/SoundManager';

export interface SettingsPopupOptions {
    onClose: () => void;
    onSoundChange?: () => void;
}

export class SettingsPopup {
    private overlay: HTMLDivElement;
    private muteBtn: HTMLButtonElement;
    private volumeSlider: HTMLInputElement;
    private volumeValue: HTMLElement;
    private keyHandler: ((e: KeyboardEvent) => void) | null = null;

    constructor(options: SettingsPopupOptions) {
        const sound = SoundManager.getInstance();

        this.overlay = document.createElement('div');
        this.overlay.className = 'settings-popup';
        this.overlay.innerHTML = `
            <div class="settings-popup__panel">
                <button class="settings-popup__close" type="button" aria-label="Close">×</button>
                <div class="settings-popup__header">SETTINGS</div>
                <div class="settings-popup__section">
                    <div class="settings-popup__section-title">SOUND</div>
                    <div class="settings-popup__row">
                        <span class="settings-popup__label">ENABLED</span>
                        <button class="snes-button settings-popup__mute" type="button"></button>
                    </div>
                    <div class="settings-popup__row settings-popup__row--volume">
                        <span class="settings-popup__label">VOLUME</span>
                        <div class="settings-popup__slider-wrap">
                            <input class="settings-popup__slider" type="range" min="0" max="100" step="1" />
                            <span class="settings-popup__volume-value"></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        this.muteBtn = this.overlay.querySelector('.settings-popup__mute') as HTMLButtonElement;
        this.volumeSlider = this.overlay.querySelector('.settings-popup__slider') as HTMLInputElement;
        this.volumeValue = this.overlay.querySelector('.settings-popup__volume-value') as HTMLElement;

        this.syncControls(sound);
        this.bindEvents(sound, options);
        this.animateIn();
    }

    private syncControls(sound: SoundManager): void {
        const muted = sound.isMuted();
        this.muteBtn.textContent = muted ? 'OFF' : 'ON';
        this.muteBtn.classList.toggle('has-ember-color', muted);
        this.muteBtn.classList.toggle('has-ocean-color', !muted);

        const vol = Math.round(sound.getVolume() * 100);
        this.volumeSlider.value = `${vol}`;
        this.volumeSlider.disabled = muted;
        this.volumeValue.textContent = muted ? '—' : `${vol}%`;
    }

    private bindEvents(sound: SoundManager, options: SettingsPopupOptions): void {
        const panel = this.overlay.querySelector('.settings-popup__panel') as HTMLElement;
        const close = (): void => {
            this.destroy();
            options.onClose();
        };

        this.overlay.querySelector('.settings-popup__close')?.addEventListener('click', close);
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) close();
        });

        this.muteBtn.addEventListener('click', () => {
            sound.setMuted(!sound.isMuted());
            this.syncControls(sound);
            options.onSoundChange?.();
        });

        this.volumeSlider.addEventListener('input', () => {
            const vol = Number(this.volumeSlider.value) / 100;
            sound.setVolume(vol);
            if (sound.isMuted()) {
                sound.setMuted(false);
            }
            this.syncControls(sound);
            options.onSoundChange?.();
        });

        this.keyHandler = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', this.keyHandler);
    }

    private animateIn(): void {
        const panel = this.overlay.querySelector('.settings-popup__panel') as HTMLElement;
        const anim = { overlayAlpha: 0, panelScale: 0.9, panelY: 20 };

        const apply = (): void => {
            this.overlay.style.opacity = `${anim.overlayAlpha}`;
            panel.style.transform = `scale(${anim.panelScale}) translateY(${anim.panelY}px)`;
        };
        apply();

        gsap.timeline({ onUpdate: apply })
            .to(anim, { overlayAlpha: 1, duration: 0.25, ease: 'power2.out' })
            .to(anim, { panelScale: 1, panelY: 0, duration: 0.35, ease: 'back.out(1.5)' }, 0.04);
    }

    public destroy(): void {
        if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
        this.overlay.remove();
    }
}