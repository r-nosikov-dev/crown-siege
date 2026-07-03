import * as PIXI from 'pixi.js';
import { SceneManager } from './SceneManager';
import { AssetsLoader } from './AssetsLoader';
import { AudioLoader } from './AudioLoader';
import { SoundManager } from './SoundManager';
import { MenuScene } from '../scenes/MenuScene';
import { GameScene } from '../scenes/GameScene';
import { getDevicePixelRatio, getViewportSize, setupViewportListeners } from './Viewport';
import { loadGameFonts } from './FontLoader';

export class GameApp {
    private static instance: GameApp;
    public app: PIXI.Application;
    public sceneManager: SceneManager;
    private removeViewportListeners: (() => void) | null = null;

    private constructor() {
        this.app = new PIXI.Application();
    }

    public static getInstance(): GameApp {
        if (!GameApp.instance) {
            GameApp.instance = new GameApp();
        }
        return GameApp.instance;
    }

    public async init(): Promise<void> {
        document.body.classList.add('game-loading');
        await loadGameFonts();

        const { width, height } = getViewportSize();

        await this.app.init({
            width,
            height,
            backgroundColor: 0x1099bb,
            resolution: getDevicePixelRatio(),
            autoDensity: true,
            resizeTo: undefined,
        });

        const canvas = this.app.canvas as HTMLCanvasElement;
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.touchAction = 'none';
        canvas.style.opacity = '0';
        document.body.appendChild(canvas);

        await AssetsLoader.getInstance().loadGameAssets();
        await AudioLoader.getInstance().loadAudioManifest();
        SoundManager.getInstance().init();

        this.sceneManager = new SceneManager(this.app.stage);

        this.removeViewportListeners = setupViewportListeners(() => this.handleResize());
        this.handleResize();

        this.sceneManager.addScene('menu', new MenuScene());
        this.sceneManager.addScene('game', new GameScene());

        this.sceneManager.switchTo('menu');

        canvas.style.opacity = '1';
        document.body.classList.remove('game-loading');
    }

    private handleResize(): void {
        const { width, height } = getViewportSize();
        const dpr = getDevicePixelRatio();

        this.app.renderer.resolution = dpr;
        this.app.renderer.resize(width, height);
        this.sceneManager.resize(width, height);
    }

    public destroy(): void {
        this.removeViewportListeners?.();
        this.removeViewportListeners = null;
    }
}