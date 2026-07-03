import * as PIXI from 'pixi.js';
import { SceneManager } from './SceneManager';
import { AssetsLoader } from './AssetsLoader';
import { AudioLoader } from './AudioLoader';
import { SoundManager } from './SoundManager';
import { MenuScene } from '../scenes/MenuScene';
import { GameScene } from '../scenes/GameScene';
import { getDevicePixelRatio, getViewportSize, setupViewportListeners } from './Viewport';
import { loadGameFonts } from './FontLoader';
import { LoadingScreen } from '../ui/LoadingScreen';

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
        LoadingScreen.bind();
        LoadingScreen.setPhase(0, 0);

        await loadGameFonts();
        LoadingScreen.setPhase(0, 1);

        const { width, height } = getViewportSize();

        LoadingScreen.setPhase(1, 0);
        await this.app.init({
            width,
            height,
            backgroundColor: 0x1099bb,
            resolution: getDevicePixelRatio(),
            autoDensity: true,
            resizeTo: undefined,
        });
        LoadingScreen.setPhase(1, 1);

        const canvas = this.app.canvas as HTMLCanvasElement;
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.touchAction = 'none';
        canvas.style.opacity = '0';
        document.body.appendChild(canvas);

        LoadingScreen.setPhase(2, 0);
        await AssetsLoader.getInstance().loadGameAssets(progress => {
            LoadingScreen.setPhase(2, progress);
        });
        LoadingScreen.setPhase(2, 1);

        LoadingScreen.setPhase(3, 0);
        await AudioLoader.getInstance().loadAudioManifest();
        SoundManager.getInstance().init();
        LoadingScreen.setPhase(3, 1);

        LoadingScreen.setPhase(4, 0);
        this.sceneManager = new SceneManager(this.app.stage);

        this.removeViewportListeners = setupViewportListeners(() => this.handleResize());
        this.handleResize();

        this.sceneManager.addScene('menu', new MenuScene());
        this.sceneManager.addScene('game', new GameScene());

        this.sceneManager.switchTo('menu');
        LoadingScreen.setPhase(4, 1);

        canvas.style.opacity = '1';
        await LoadingScreen.hide();
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