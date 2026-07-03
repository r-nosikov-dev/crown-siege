import { Scene } from './Scene';
import * as PIXI from 'pixi.js';
import { GameApp } from '../core/GameApp';
import { AssetsLoader, ASSETS } from '../core/AssetsLoader';
import { ArsenalInfoPopup } from '../ui/ArsenalInfoPopup';
import { RatingPopup } from '../ui/RatingPopup';
import { IntroStoryPopup } from '../ui/IntroStoryPopup';
import { GAME_SUBTITLE, GAME_TAGLINE, GAME_TITLE } from '../core/GameConfig';
import { invalidatePixiText } from '../core/FontLoader';
import { getPlayfieldEntityScale, getViewportSize, isPhoneViewport } from '../core/Viewport';
import {
    menuSubtitleStyle,
    menuTaglineStyle,
    menuTitleGlowStyle,
    menuTitleStyle,
} from '../styles/GameTypography';

export class MenuScene extends Scene {
    private skyBg: PIXI.Graphics;
    private overlay: PIXI.Graphics;
    private decor: PIXI.Container;
    private castleShadow: PIXI.Graphics;
    private castleSprite: PIXI.Sprite;
    private title: PIXI.Text;
    private titleGlow: PIXI.Text;
    private subtitle: PIXI.Text;
    private tagline: PIXI.Text;
    private startButton: HTMLButtonElement | null = null;
    private infoButton: HTMLButtonElement | null = null;
    private ratingButton: HTMLButtonElement | null = null;
    private arsenalPopup: ArsenalInfoPopup | null = null;
    private ratingPopup: RatingPopup | null = null;
    private introPopup: IntroStoryPopup | null = null;
    private bobPhase = 0;
    private castleBaseY = 0;

    constructor() {
        super();

        this.skyBg = new PIXI.Graphics();
        this.skyBg.eventMode = 'none';

        this.overlay = new PIXI.Graphics();
        this.overlay.eventMode = 'none';

        this.decor = new PIXI.Container();
        this.castleShadow = new PIXI.Graphics();
        this.castleSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
        this.castleSprite.anchor.set(0.5, 1);

        this.titleGlow = new PIXI.Text({
            text: GAME_TITLE,
            style: menuTitleGlowStyle(),
        });
        this.titleGlow.anchor.set(0.5);

        this.title = new PIXI.Text({
            text: GAME_TITLE,
            style: menuTitleStyle(),
        });
        this.title.anchor.set(0.5);

        this.subtitle = new PIXI.Text({
            text: GAME_SUBTITLE,
            style: menuSubtitleStyle(),
        });
        this.subtitle.anchor.set(0.5);

        this.tagline = new PIXI.Text({
            text: GAME_TAGLINE,
            style: menuTaglineStyle(),
        });
        this.tagline.anchor.set(0.5);

        this.decor.addChild(this.castleShadow, this.castleSprite);
        this.addChild(
            this.skyBg,
            this.overlay,
            this.decor,
            this.titleGlow,
            this.title,
            this.subtitle,
            this.tagline,
        );
    }

    public onActivate(): void {
        const assets = AssetsLoader.getInstance();
        this.castleSprite.texture = assets.getTexture(ASSETS.CASTLE);
        this.createMenuButtons();

        invalidatePixiText(this.title, this.titleGlow, this.subtitle, this.tagline);

        const { width, height } = getViewportSize();
        this.resize(width, height);
    }

    public onDeactivate(): void {
        this.cleanup();
    }

    private createMenuButtons(): void {
        if (!this.startButton) {
            this.startButton = document.createElement('button');
            this.startButton.className = 'snes-button has-ember-color menu-start-btn';
            this.startButton.innerText = 'START GAME';
            this.startButton.onclick = () => this.openIntroPopup();
            document.body.appendChild(this.startButton);
        }

        if (!this.infoButton) {
            this.infoButton = document.createElement('button');
            this.infoButton.className = 'snes-button has-ocean-color menu-info-btn';
            this.infoButton.innerText = 'WEAPONS & BONUSES';
            this.infoButton.onclick = () => this.openArsenalPopup();
            document.body.appendChild(this.infoButton);
        }

        if (!this.ratingButton) {
            this.ratingButton = document.createElement('button');
            this.ratingButton.className = 'snes-button has-sun-color menu-rating-btn';
            this.ratingButton.innerText = 'RATING';
            this.ratingButton.onclick = () => this.openRatingPopup();
            document.body.appendChild(this.ratingButton);
        }
    }

    private openArsenalPopup(): void {
        if (this.arsenalPopup) return;
        this.arsenalPopup = new ArsenalInfoPopup({
            onClose: () => {
                this.arsenalPopup = null;
            },
        });
    }

    private openRatingPopup(): void {
        if (this.ratingPopup) return;
        this.ratingPopup = new RatingPopup({
            onClose: () => {
                this.ratingPopup = null;
            },
        });
    }

    private openIntroPopup(): void {
        if (this.introPopup) return;
        this.introPopup = new IntroStoryPopup({
            onBegin: () => {
                this.introPopup = null;
                GameApp.getInstance().sceneManager.switchTo('game');
            },
            onCancel: () => {
                this.introPopup = null;
            },
        });
    }

    private cleanup(): void {
        if (this.introPopup) {
            this.introPopup.destroy();
            this.introPopup = null;
        }
        if (this.arsenalPopup) {
            this.arsenalPopup.destroy();
            this.arsenalPopup = null;
        }
        if (this.ratingPopup) {
            this.ratingPopup.destroy();
            this.ratingPopup = null;
        }
        if (this.startButton?.parentNode) {
            this.startButton.parentNode.removeChild(this.startButton);
            this.startButton = null;
        }
        if (this.infoButton?.parentNode) {
            this.infoButton.parentNode.removeChild(this.infoButton);
            this.infoButton = null;
        }
        if (this.ratingButton?.parentNode) {
            this.ratingButton.parentNode.removeChild(this.ratingButton);
            this.ratingButton = null;
        }
    }

    private drawSky(width: number, height: number): void {
        this.skyBg.clear();
        this.skyBg.rect(0, 0, width, height).fill(0x3d9ee8);

        const bands = 8;
        for (let i = 0; i < bands; i++) {
            const t = i / bands;
            const bandH = height / bands + 2;
            const color = PIXI.Color.shared.setValue([
                0x7ec8ff,
                0x5eb5f7,
                0x45a5ef,
                0x3d9ee8,
                0x2f8fd9,
                0x247fc8,
                0x1a6eb5,
                0x125c9c,
            ][i]).toNumber();
            this.skyBg.rect(0, t * height, width, bandH).fill({ color, alpha: 0.55 + t * 0.12 });
        }
    }

    private drawOverlay(width: number, height: number): void {
        this.overlay.clear();
        this.overlay.rect(0, 0, width, height * 0.42)
            .fill({ color: 0xffffff, alpha: 0.08 });
        this.overlay.rect(0, height * 0.58, width, height * 0.42)
            .fill({ color: 0x003d6b, alpha: 0.18 });

        const cloudY = height * 0.14;
        for (let i = 0; i < 5; i++) {
            const cx = width * (0.12 + i * 0.19);
            const cy = cloudY + (i % 2) * 18;
            this.overlay.circle(cx, cy, 28 + (i % 3) * 8)
                .fill({ color: 0xffffff, alpha: 0.07 });
            this.overlay.circle(cx + 22, cy + 6, 20 + (i % 2) * 6)
                .fill({ color: 0xffffff, alpha: 0.06 });
        }
    }

    public update(delta: number): void {
        this.bobPhase += delta * 0.03;
        this.castleSprite.y = this.castleBaseY + Math.sin(this.bobPhase) * 4;
        this.titleGlow.alpha = 0.35 + Math.sin(this.bobPhase * 1.4) * 0.15;
    }

    private layoutTitle(width: number): void {
        const titlePad = width < 400 ? 24 : 32;
        const maxTitleWidth = width - titlePad;
        const useTwoLines = width < 480;
        const titleText = useTwoLines ? 'CROWN\nSIEGE' : GAME_TITLE;

        this.title.text = titleText;
        this.titleGlow.text = titleText;
        this.title.scale.set(1);
        this.titleGlow.scale.set(1);

        let titleSize = isPhoneViewport()
            ? Math.max(10, Math.min(20, width * 0.032))
            : Math.max(14, Math.min(34, width * 0.042));

        const applyTitleSize = (size: number): void => {
            this.title.style.fontSize = size;
            this.titleGlow.style.fontSize = size + 1;
            this.title.style.align = 'center';
            this.titleGlow.style.align = 'center';
            this.title.style.wordWrap = !useTwoLines;
            this.title.style.wordWrapWidth = useTwoLines ? 0 : maxTitleWidth;
            this.title.style.breakWords = !useTwoLines;
            this.titleGlow.style.wordWrap = !useTwoLines;
            this.titleGlow.style.wordWrapWidth = useTwoLines ? 0 : maxTitleWidth;
            this.titleGlow.style.breakWords = !useTwoLines;
            if (useTwoLines) {
                this.title.style.lineHeight = size + 6;
                this.titleGlow.style.lineHeight = size + 7;
            }
        };

        applyTitleSize(titleSize);
        while (titleSize > 8 && this.title.width > maxTitleWidth) {
            titleSize -= 0.5;
            applyTitleSize(titleSize);
        }

        if (this.title.width > maxTitleWidth) {
            const scale = maxTitleWidth / this.title.width;
            this.title.scale.set(scale);
            this.titleGlow.scale.set(scale);
        }
    }

    public resize(width: number, height: number): void {
        this.drawSky(width, height);
        this.drawOverlay(width, height);

        const entityScale = getPlayfieldEntityScale();
        const castleSize = Math.min(100, width * 0.19) * (entityScale < 1 ? entityScale + 0.15 : 1);
        const castleTex = this.castleSprite.texture;
        if (castleTex.width > 0) {
            const s = castleSize / Math.max(castleTex.width, castleTex.height);
            this.castleSprite.scale.set(s);
        }

        const heroTop = height * (width < 400 ? 0.05 : 0.07);
        const castleY = heroTop + castleSize;
        this.castleShadow.clear();
        const shadowW = castleSize * 0.75;
        const shadowH = castleSize * 0.2;
        const shadowY = castleY + 6;
        this.castleShadow.ellipse(0, shadowY, shadowW, shadowH)
            .fill({ color: 0x000000, alpha: 0.3 });
        this.castleShadow.ellipse(0, shadowY, shadowW * 0.82, shadowH * 0.72)
            .fill({ color: 0x000000, alpha: 0.17 });

        this.layoutTitle(width);

        this.subtitle.style.fontSize = Math.max(7, Math.min(10, width * 0.02));
        this.tagline.style.fontSize = Math.max(6, Math.min(8, width * 0.015));
        this.tagline.style.lineHeight = Math.max(10, width * 0.021);

        this.decor.position.set(width / 2, 0);
        this.castleSprite.position.set(0, castleY);
        this.castleBaseY = castleY;

        const titleGap = Math.max(32, width < 400 ? 28 : 40);
        const titleY = castleY + titleGap + this.title.height / 2;
        this.title.position.set(width / 2, titleY);
        this.titleGlow.position.set(width / 2 + 2, titleY + 2);

        const titleFontSize = Number(this.title.style.fontSize) || 13;
        const subtitleY = titleY + this.title.height / 2 + Math.max(10, titleFontSize * 0.28) + this.subtitle.height / 2;
        this.subtitle.position.set(width / 2, subtitleY);

        const taglineY = subtitleY + this.subtitle.height / 2 + Math.max(10, width < 400 ? 10 : 14) + this.tagline.height / 2;
        this.tagline.position.set(width / 2, taglineY);

        const btnFont = Math.max(8, Math.min(14, width * 0.022));
        const btnPad = width < 400 ? '10px 14px' : '14px 28px';
        const startTop = taglineY + this.tagline.height / 2 + 22;

        if (this.startButton) {
            this.startButton.style.fontSize = `${btnFont}px`;
            this.startButton.style.padding = btnPad;
            this.startButton.style.top = `${startTop}px`;
        }

        const btnGap = width < 400 ? 46 : 52;

        if (this.infoButton) {
            this.infoButton.style.fontSize = `${Math.max(7, btnFont - 1)}px`;
            this.infoButton.style.padding = btnPad;
            this.infoButton.style.top = `${startTop + btnGap}px`;
        }

        if (this.ratingButton) {
            this.ratingButton.style.fontSize = `${Math.max(7, btnFont - 1)}px`;
            this.ratingButton.style.padding = btnPad;
            this.ratingButton.style.top = `${startTop + btnGap * 2}px`;
        }
    }
}