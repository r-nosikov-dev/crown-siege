import * as PIXI from 'pixi.js';
import { formatTime } from '../game/SurvivalConfig';
import { ActiveWeapon } from '../game/GameController';
import { isPhoneViewport } from '../core/Viewport';
import { hudButtonStyle, hudLabelStyle, hudValueStyle } from '../styles/GameTypography';

const BTN_LABELS = {
    pause: 'PAUSE',
    sound: 'SOUND',
    settings: 'SETTINGS',
} as const;

interface HudLayout {
    hudHeight: number;
    padding: number;
    labelSize: number;
    valueSize: number;
    btnWidth: number;
    btnHeight: number;
    btnFontSize: number;
    btnGap: number;
    showLabels: boolean;
    pauseLabel: string;
    soundLabel: string;
    settingsLabel: string;
}

interface HudButton {
    container: PIXI.Container;
    border: PIXI.Graphics;
    inner: PIXI.Graphics;
    label: PIXI.Text;
    color: number;
}

const MAX_BTN_WIDTH = 80;
const MIN_BTN_WIDTH = 34;
const LABEL_VALUE_GAP = 6;

function computeLayout(screenWidth: number): HudLayout {
    const isPhone = isPhoneViewport();
    const padding = screenWidth < 380 ? 6 : screenWidth < 640 ? 10 : 14;
    const btnGap = screenWidth < 380 ? 4 : 6;

    let btnWidth = screenWidth >= 900 ? 78 : screenWidth >= 640 ? 64 : screenWidth >= 480 ? 54 : 44;
    let btnHeight = screenWidth < 380 ? 24 : screenWidth < 640 ? 28 : 32;
    let btnFontSize = isPhone
        ? (screenWidth < 360 ? 5 : screenWidth < 400 ? 5.5 : 6)
        : (screenWidth < 640 ? 8 : 9);

    const statsReserve = isPhone
        ? (screenWidth < 380 ? 128 : 148)
        : (screenWidth < 640 ? 280 : 380);
    const maxFitWidth = Math.floor((screenWidth - padding * 2 - statsReserve - btnGap * 2) / 3);
    btnWidth = Math.max(MIN_BTN_WIDTH, Math.min(MAX_BTN_WIDTH, btnWidth, maxFitWidth));

    const showLabels = screenWidth >= 560;
    const hudHeight = showLabels
        ? screenWidth >= 900 ? 88 : 76
        : screenWidth < 380 ? 50 : 58;

    return {
        hudHeight,
        padding,
        labelSize: showLabels ? (screenWidth >= 900 ? 8 : 7) : 0,
        valueSize: screenWidth < 380 ? 9 : screenWidth < 640 ? 10 : screenWidth >= 900 ? 14 : 12,
        btnWidth,
        btnHeight,
        btnFontSize,
        btnGap,
        showLabels,
        pauseLabel: BTN_LABELS.pause,
        soundLabel: BTN_LABELS.sound,
        settingsLabel: BTN_LABELS.settings,
    };
}

export class HUD extends PIXI.Container {
    private topBar: PIXI.Graphics;
    private timeLabel: PIXI.Text;
    private timeValue: PIXI.Text;
    private killsLabel: PIXI.Text;
    private killsValue: PIXI.Text;
    private scoreLabel: PIXI.Text;
    private scoreValue: PIXI.Text;
    private weaponLabel: PIXI.Text;
    private weaponValue: PIXI.Text;
    private pauseBtn: HudButton;
    private soundBtn: HudButton;
    private settingsBtn: HudButton;
    private screenWidth = window.innerWidth;

    private layout: HudLayout = computeLayout(window.innerWidth);

    public get hudHeight(): number {
        return this.layout.hudHeight;
    }

    constructor() {
        super();
        this.createUI();
        this.setupInputShield();
    }

    private setupInputShield(): void {
        const block = (e: PIXI.FederatedPointerEvent): void => {
            e.stopPropagation();
        };
        this.on('pointerdown', block);
        this.on('pointertap', block);
        this.topBar.on('pointerdown', block);
        this.topBar.on('pointertap', block);
    }

    private createUI(): void {
        this.topBar = new PIXI.Graphics();
        this.addChild(this.topBar);

        this.timeLabel = new PIXI.Text({ text: 'TIME', style: this.labelStyle() });
        this.timeValue = new PIXI.Text({ text: '00:00', style: this.valueStyle() });
        this.killsLabel = new PIXI.Text({ text: 'KILLS', style: this.labelStyle() });
        this.killsValue = new PIXI.Text({ text: '0', style: this.valueStyle() });
        this.scoreLabel = new PIXI.Text({ text: 'SCORE', style: this.labelStyle() });
        this.scoreValue = new PIXI.Text({ text: '0', style: this.valueStyle() });
        this.weaponLabel = new PIXI.Text({ text: 'GUN', style: this.labelStyle() });
        this.weaponValue = new PIXI.Text({ text: '', style: this.valueStyle() });
        this.weaponLabel.visible = false;
        this.weaponValue.visible = false;

        this.addChild(
            this.timeLabel, this.timeValue,
            this.killsLabel, this.killsValue,
            this.scoreLabel, this.scoreValue,
            this.weaponLabel, this.weaponValue,
        );

        this.pauseBtn = this.createButton('PAUSE', 0x0099cc);
        this.soundBtn = this.createButton('SOUND', 0x777777);
        this.settingsBtn = this.createButton('SET', 0x5c5c8a);
        this.addChild(this.pauseBtn.container, this.soundBtn.container, this.settingsBtn.container);
    }

    private labelStyle(): Partial<PIXI.TextStyle> {
        return hudLabelStyle(this.layout.labelSize);
    }

    private valueStyle(): Partial<PIXI.TextStyle> {
        return hudValueStyle(this.layout.valueSize);
    }

    private createButton(text: string, color: number): HudButton {
        const container = new PIXI.Container();
        const border = new PIXI.Graphics();
        const inner = new PIXI.Graphics();
        const label = new PIXI.Text({
            text,
            style: hudButtonStyle(this.layout.btnFontSize),
        });

        container.addChild(border, inner, label);
        label.anchor.set(0.5);
        border.eventMode = 'none';
        inner.eventMode = 'none';
        label.eventMode = 'none';
        container.interactiveChildren = false;
        container.eventMode = 'static';
        container.cursor = 'pointer';
        container.on('pointerover', () => { inner.tint = 0xdddddd; });
        container.on('pointerout', () => { inner.tint = 0xffffff; });

        return { container, border, inner, label, color };
    }

    private bindButtonClick(btn: HudButton, cb: () => void): void {
        const handler = (e: PIXI.FederatedPointerEvent): void => {
            e.stopPropagation();
            cb();
        };
        btn.container.on('pointertap', handler);
    }

    private fitButtonFont(label: PIXI.Text, text: string, btnWidth: number, btnHeight: number, startSize: number): void {
        const minSize = isPhoneViewport() ? 4 : 6;
        let fontSize = startSize;
        label.text = text;

        while (fontSize > minSize) {
            label.style.fontSize = fontSize;
            if (label.width <= btnWidth - 6 && label.height <= btnHeight - 6) break;
            fontSize -= 0.5;
        }

        label.style.fontSize = Math.max(minSize, fontSize);
    }

    private redrawButton(btn: HudButton, text: string, fontScale = 1): void {
        const { btnWidth, btnHeight, btnFontSize } = this.layout;
        const { border, inner, label, color } = btn;

        border.clear();
        border.roundRect(0, 0, btnWidth, btnHeight, 3).fill(0x000000);
        inner.clear();
        inner.roundRect(2, 2, btnWidth - 4, btnHeight - 4, 3).fill(color);
        inner.roundRect(2, 2, btnWidth - 4, btnHeight / 2 - 2, 3).fill({ color: 0xffffff, alpha: 0.25 });
        inner.tint = 0xffffff;

        this.fitButtonFont(label, text, btnWidth, btnHeight, btnFontSize * fontScale);
        label.position.set(btnWidth / 2, btnHeight / 2);
        btn.container.hitArea = new PIXI.Rectangle(0, 0, btnWidth, btnHeight);
    }

    private applyTextStyles(): void {
        [this.timeLabel, this.killsLabel, this.scoreLabel, this.weaponLabel].forEach(t => Object.assign(t.style, this.labelStyle()));
        [this.timeValue, this.killsValue, this.scoreValue, this.weaponValue].forEach(t => Object.assign(t.style, this.valueStyle()));
    }

    private placeColumn(label: PIXI.Text, value: PIXI.Text, x: number, top: number): number {
        label.anchor.set(0, 0);
        value.anchor.set(0, 0);
        label.position.set(x, top);
        value.position.set(x, top + (this.layout.showLabels ? label.height + LABEL_VALUE_GAP : 0));
        return Math.max(label.width, value.width);
    }

    private layoutButtons(): void {
        const { padding, btnWidth, btnHeight, btnGap, hudHeight } = this.layout;
        const btnY = Math.round((hudHeight - btnHeight) / 2);
        const settingsX = this.screenWidth - padding - btnWidth;
        const soundX = settingsX - btnGap - btnWidth;
        const pauseX = soundX - btnGap - btnWidth;

        this.redrawButton(this.pauseBtn, this.layout.pauseLabel);
        this.redrawButton(this.soundBtn, this.layout.soundLabel);
        this.redrawButton(this.settingsBtn, this.layout.settingsLabel, 0.72);
        this.pauseBtn.container.position.set(pauseX, btnY);
        this.soundBtn.container.position.set(soundX, btnY);
        this.settingsBtn.container.position.set(settingsX, btnY);
    }

    private layoutStats(): void {
        const { padding, hudHeight, showLabels, labelSize } = this.layout;
        const statsRight = this.pauseBtn.container.x - 8;
        const valueH = this.timeValue.height;
        const rowTop = Math.round((hudHeight - (showLabels ? labelSize + LABEL_VALUE_GAP + valueH : valueH)) / 2);

        const statColumns = this.weaponValue.visible ? 4 : 3;
        const colGap = Math.max(10, Math.floor((statsRight - padding) / statColumns));

        const weaponVisible = this.weaponValue.visible;

        if (showLabels) {
            [this.timeLabel, this.killsLabel, this.scoreLabel].forEach(l => { l.visible = true; });
            this.weaponLabel.visible = weaponVisible;
            this.placeColumn(this.timeLabel, this.timeValue, padding, rowTop);
            this.placeColumn(this.killsLabel, this.killsValue, padding + colGap, rowTop);
            this.placeColumn(this.scoreLabel, this.scoreValue, padding + colGap * 2, rowTop);
            if (weaponVisible) {
                this.placeColumn(this.weaponLabel, this.weaponValue, padding + colGap * 3, rowTop);
            }
        } else {
            [this.timeLabel, this.killsLabel, this.scoreLabel, this.weaponLabel].forEach(l => { l.visible = false; });
            const centerY = Math.round(hudHeight / 2);
            this.timeValue.anchor.set(0, 0.5);
            this.killsValue.anchor.set(0, 0.5);
            this.scoreValue.anchor.set(0, 0.5);
            this.weaponValue.anchor.set(0, 0.5);
            this.timeValue.position.set(padding, centerY);
            this.killsValue.position.set(padding + colGap, centerY);
            this.scoreValue.position.set(padding + colGap * 2, centerY);
            if (weaponVisible) {
                this.weaponValue.position.set(padding + colGap * 3, centerY);
            }
        }
    }

    public resize(width: number, _height: number): void {
        this.screenWidth = width;
        this.layout = computeLayout(width);
        this.applyTextStyles();
        this.topBar.clear();
        this.topBar.rect(0, 0, width, this.layout.hudHeight).fill(0x000000);
        this.topBar.eventMode = 'static';
        this.topBar.hitArea = new PIXI.Rectangle(0, 0, width, this.layout.hudHeight);
        this.eventMode = 'static';
        this.hitArea = new PIXI.Rectangle(0, 0, width, this.layout.hudHeight);
        this.layoutButtons();
        this.layoutStats();
    }

    public updateTime(seconds: number): void {
        this.timeValue.text = formatTime(seconds);
        this.layoutStats();
    }

    public updateKills(kills: number): void {
        this.killsValue.text = `${kills}`;
        this.layoutStats();
    }

    public updateScore(score: number, nextHealAt: number): void {
        this.scoreValue.text = `${score}`;
        const remaining = nextHealAt - score;
        this.scoreValue.style.fill = remaining > 0 && remaining <= 250 ? 0xffdd44 : 0xffffff;
        this.layoutStats();
    }

    public updateWeapon(weapon: ActiveWeapon, ammo: number, status: 'ready' | 'pump' | 'reload' | 'overheat'): void {
        if (weapon === 'pistol') {
            this.weaponLabel.visible = false;
            this.weaponValue.visible = false;
            this.layoutStats();
            return;
        }

        this.weaponValue.visible = true;
        if (weapon === 'rpg') {
            this.weaponLabel.text = 'RPG';
            if (status === 'reload') {
                this.weaponValue.text = 'LOAD';
                this.weaponValue.style.fill = 0xffaa44;
            } else {
                this.weaponValue.text = `R:${ammo}`;
                this.weaponValue.style.fill = 0xff5533;
            }
        } else if (weapon === 'assault') {
            this.weaponLabel.text = 'AK';
            if (status === 'overheat') {
                this.weaponValue.text = 'HOT!';
                this.weaponValue.style.fill = 0xff3333;
            } else {
                this.weaponValue.text = 'AUTO';
                this.weaponValue.style.fill = 0x88dd66;
            }
        } else if (weapon === 'minigun') {
            this.weaponLabel.text = 'MG';
            if (status === 'overheat') {
                this.weaponValue.text = 'HOT!';
                this.weaponValue.style.fill = 0xff3333;
            } else {
                this.weaponValue.text = 'AUTO';
                this.weaponValue.style.fill = 0xff88cc;
            }
        } else {
            this.weaponLabel.text = 'GUN';
            if (status === 'pump') {
                this.weaponValue.text = 'PUMP';
                this.weaponValue.style.fill = 0xffaa44;
            } else {
                this.weaponValue.text = `SG:${ammo}`;
                this.weaponValue.style.fill = 0xff8866;
            }
        }
        this.layoutStats();
    }

    public onPauseClick(cb: () => void): void {
        this.bindButtonClick(this.pauseBtn, cb);
    }

    public onSoundClick(cb: () => void): void {
        this.bindButtonClick(this.soundBtn, cb);
    }

    public onSettingsClick(cb: () => void): void {
        this.bindButtonClick(this.settingsBtn, cb);
    }

    public setSoundText(isOn: boolean): void {
        this.soundBtn.label.alpha = isOn ? 1 : 0.5;
    }
}