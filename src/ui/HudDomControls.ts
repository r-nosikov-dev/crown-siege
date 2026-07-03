export interface HudButtonRect {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
}

export interface HudDomLayout {
    pause: HudButtonRect;
    sound: HudButtonRect;
    settings: HudButtonRect;
}

export interface HudDomControlsHandlers {
    onPause: () => void;
    onSound: () => void;
    onSettings: () => void;
}

type HudDomButton = HTMLButtonElement;

export class HudDomControls {
    private readonly pauseBtn: HudDomButton;
    private readonly soundBtn: HudDomButton;
    private readonly settingsBtn: HudDomButton;

    constructor(handlers: HudDomControlsHandlers) {
        this.pauseBtn = this.createButton('hud-controls__btn hud-controls__btn--pause', 'PAUSE', handlers.onPause);
        this.soundBtn = this.createButton('hud-controls__btn hud-controls__btn--sound', 'SOUND', handlers.onSound);
        this.settingsBtn = this.createButton('hud-controls__btn hud-controls__btn--settings', 'SET', handlers.onSettings);

        document.body.append(this.pauseBtn, this.soundBtn, this.settingsBtn);
    }

    private createButton(className: string, label: string, onClick: () => void): HudDomButton {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = className;
        btn.textContent = label;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        });
        return btn;
    }

    public layout(layout: HudDomLayout): void {
        this.place(this.pauseBtn, layout.pause);
        this.place(this.soundBtn, layout.sound);
        this.place(this.settingsBtn, layout.settings);
    }

    private place(btn: HudDomButton, rect: HudButtonRect): void {
        btn.textContent = rect.label;
        btn.style.left = `${rect.x}px`;
        btn.style.top = `${rect.y}px`;
        btn.style.width = `${rect.width}px`;
        btn.style.height = `${rect.height}px`;
    }

    public setSoundActive(active: boolean): void {
        this.soundBtn.style.opacity = active ? '1' : '0.5';
    }

    public destroy(): void {
        this.pauseBtn.remove();
        this.soundBtn.remove();
        this.settingsBtn.remove();
    }
}