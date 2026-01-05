import { Scene } from './Scene';
import * as PIXI from 'pixi.js';
import { GameApp } from '../core/GameApp';

export class MenuScene extends Scene {
    private title: PIXI.Text;
    private startButton: HTMLButtonElement;

    constructor() {
        super();
        // Title (Keep in Pixi)
        this.title = new PIXI.Text('Mini Game', {
            fontFamily: 'Press Start 2P', // Use the font we loaded
            fontSize: 48,
            fill: 0xffffff,
            align: 'center',
        });
        this.title.anchor.set(0.5);
        this.addChild(this.title);
    }

    public onActivate(): void {
        this.createUI();
    }

    public onDeactivate(): void {
        this.cleanup();
    }

    private createUI(): void {
        // Start Button (HTML)
        this.startButton = document.createElement('button');
        this.startButton.className = 'snes-button has-ember-color';
        this.startButton.innerText = 'START GAME';
        this.startButton.onclick = () => {
            GameApp.getInstance().sceneManager.switchTo('game');
        };

        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) {
            uiLayer.appendChild(this.startButton);
        }
    }

    private cleanup(): void {
        if (this.startButton && this.startButton.parentNode) {
            this.startButton.parentNode.removeChild(this.startButton);
        }
    }

    public update(delta: number): void {
        // Animation if needed
    }

    public resize(width: number, height: number): void {
        this.title.position.set(width / 2, height / 3);
        // Button is centered by CSS flexbox in #ui-layer
    }
}
