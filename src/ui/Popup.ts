import * as PIXI from 'pixi.js';

export class Popup extends PIXI.Container {
    protected background: PIXI.Graphics;
    protected content: PIXI.Container;

    constructor(width: number, height: number) {
        super();
        this.background = new PIXI.Graphics();
        this.background.beginFill(0x000000, 0.8);
        this.background.drawRect(0, 0, width, height);
        this.background.endFill();
        this.addChild(this.background);

        this.content = new PIXI.Container();
        this.content.position.set(width / 2, height / 2);
        this.addChild(this.content);

        this.interactive = true; // Block clicks below
    }

    protected createButton(text: string, color: number, y: number, onClick: () => void): void {
        const btn = new PIXI.Container();
        const bg = new PIXI.Graphics();
        bg.beginFill(color);
        bg.drawRoundedRect(-75, -20, 150, 40, 5);
        bg.endFill();
        btn.addChild(bg);

        const label = new PIXI.Text(text, { fontFamily: 'Arial', fontSize: 20, fill: 0x000000 });
        label.anchor.set(0.5);
        btn.addChild(label);

        btn.position.set(0, y);
        btn.interactive = true;
        btn.cursor = 'pointer';
        btn.on('pointerdown', onClick);
        this.content.addChild(btn);
    }
}
