import * as PIXI from 'pixi.js';
import { Scene } from '../scenes/Scene';
import { getViewportSize } from './Viewport';

export class SceneManager {
    private root: PIXI.Container;
    private scenes: Map<string, Scene>;
    private currentScene: Scene | null;

    constructor(root: PIXI.Container) {
        this.root = root;
        this.scenes = new Map();
        this.currentScene = null;
        PIXI.Ticker.shared.add(this.update, this);
    }

    public addScene(name: string, scene: Scene): void {
        this.scenes.set(name, scene);
    }

    public switchTo(name: string): void {
        if (this.currentScene) {
            this.currentScene.onDeactivate();
            this.root.removeChild(this.currentScene);
        }

        const nextScene = this.scenes.get(name);
        if (nextScene) {
            this.currentScene = nextScene;
            this.root.addChild(this.currentScene);
            const { width, height } = getViewportSize();
            this.currentScene.resize(width, height);
            this.currentScene.onActivate();
        } else {
            console.error(`Scene '${name}' not found!`);
        }
    }

    public update(ticker: PIXI.Ticker): void {
        if (this.currentScene) {
            this.currentScene.update(ticker.deltaTime);
        }
    }

    public resize(width: number, height: number): void {
        if (this.currentScene) {
            this.currentScene.resize(width, height);
        }
    }
}
