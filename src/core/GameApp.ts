import * as PIXI from 'pixi.js';
import { SceneManager } from './SceneManager';
import { MenuScene } from '../scenes/MenuScene';
import { GameScene } from '../scenes/GameScene';

export class GameApp {
    private static instance: GameApp;
    public app: PIXI.Application;
    public sceneManager: SceneManager;

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
        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x1099bb,
            resolution: window.devicePixelRatio || 1,
        });

        document.body.appendChild(this.app.canvas as unknown as Node);

        this.sceneManager = new SceneManager(this.app.stage);

        // Handle resize
        window.addEventListener('resize', () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
            if (this.sceneManager) {
                this.sceneManager.resize(window.innerWidth, window.innerHeight);
            }
        });

        // Initialize Scenes
        this.sceneManager.addScene('menu', new MenuScene());
        this.sceneManager.addScene('game', new GameScene());

        // Start with Menu
        this.sceneManager.switchTo('menu');
    }
}
