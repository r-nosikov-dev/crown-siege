import * as PIXI from 'pixi.js';

export class HUD extends PIXI.Container {
    private topBar: PIXI.Graphics;
    private timeLabel: PIXI.Text;
    private timeValue: PIXI.Text;
    private scoreLabel: PIXI.Text;
    private scoreValue: PIXI.Text;
    private pauseBtn: PIXI.Container;
    private soundBtn: PIXI.Container;

    public readonly hudHeight: number = 80;

    constructor() {
        super();
        this.createUI();
    }

    private createUI(): void {
        // Top Bar Background
        this.topBar = new PIXI.Graphics();
        this.addChild(this.topBar);

        const fontStyleLabel = { fontFamily: 'Press Start 2P', fontSize: 16, fill: 0xffffff };
        const fontStyleValue = { fontFamily: 'Press Start 2P', fontSize: 16, fill: 0xffffff };

        // Time
        this.timeLabel = new PIXI.Text('TIME', fontStyleLabel);
        this.addChild(this.timeLabel);
        this.timeValue = new PIXI.Text('00', fontStyleValue);
        this.addChild(this.timeValue);

        // Score
        this.scoreLabel = new PIXI.Text('ENEMIES', fontStyleLabel);
        this.addChild(this.scoreLabel);
        this.scoreValue = new PIXI.Text('00/00', fontStyleValue);
        this.addChild(this.scoreValue);

        // Buttons
        // Pause -> Ocean (Blue)
        this.pauseBtn = this.createButton('PAUSE', 0x0099CC);
        this.addChild(this.pauseBtn);

        // Sound -> Galaxy (Grey/Blueish) or just Grey
        this.soundBtn = this.createButton('SOUND', 0x777777);
        this.addChild(this.soundBtn);
    }

    private createButton(text: string, color: number): PIXI.Container {
        const btn = new PIXI.Container();
        const width = 100;
        const height = 30;
        const radius = 4; // Small rounded corners

        // Shadow/Border (Black)
        const border = new PIXI.Graphics();
        border.beginFill(0x000000);
        border.drawRoundedRect(0, 0, width, height, radius);
        border.endFill();
        btn.addChild(border);

        // Inner Color (slightly smaller to create border effect)
        const inner = new PIXI.Graphics();
        inner.beginFill(color);
        // Draw slightly smaller to leave black border
        inner.drawRoundedRect(2, 2, width - 4, height - 4, radius);
        inner.endFill();

        // Highlight (Top/Left) - simplified "shine"
        inner.beginFill(0xFFFFFF, 0.3);
        inner.drawRoundedRect(2, 2, width - 4, height / 2 - 2, radius);
        inner.endFill();

        btn.addChild(inner);

        // Text (Black for contrast on these bright colors)
        const label = new PIXI.Text(text, {
            fontFamily: 'Press Start 2P',
            fontSize: 12,
            fill: 0x000000
        });
        label.anchor.set(0.5);
        label.position.set(width / 2, height / 2);
        btn.addChild(label);

        btn.interactive = true;
        btn.cursor = 'pointer';

        // Hover effect
        btn.on('pointerover', () => {
            inner.tint = 0xDDDDDD; // Lighten/Darken
        });
        btn.on('pointerout', () => {
            inner.tint = 0xFFFFFF; // Reset
        });

        return btn;
    }

    public resize(width: number, height: number): void {
        // Draw Top Bar
        this.topBar.clear();
        this.topBar.beginFill(0x000000);
        this.topBar.drawRect(0, 0, width, this.hudHeight);
        this.topBar.endFill();

        // Layout
        const padding = 20;

        // Time Group
        this.timeLabel.position.set(padding, 20);
        this.timeValue.position.set(padding, 45);

        // Score Group (Center-ish)
        const scoreX = (width - 200) / 2;
        this.scoreLabel.position.set(scoreX, 20);
        this.scoreValue.position.set(scoreX, 45);

        // Buttons (Right aligned)
        let btnX = width - padding - 100;

        if (width < 600) {
            // Mobile: Stack buttons vertically below the bar or squeeze them?
            // Let's squeeze them into the bar for now, maybe smaller
            this.soundBtn.position.set(width - 110, 10);
            this.pauseBtn.position.set(width - 110, 45);
        } else {
            this.soundBtn.position.set(btnX, 25);
            btnX -= 110;
            this.pauseBtn.position.set(btnX, 25);
        }
    }

    public updateTime(time: number): void {
        this.timeValue.text = Math.ceil(time).toString().padStart(2, '0');
    }

    public updateScore(destroyed: number, total: number): void {
        this.scoreValue.text = `${destroyed}/${total}`;
    }

    public onPauseClick(cb: () => void): void {
        this.pauseBtn.on('pointerdown', cb);
    }

    public onSoundClick(cb: () => void): void {
        this.soundBtn.on('pointerdown', cb);
    }

    public setSoundText(isOn: boolean): void {
        // Access the text child directly for simplicity in this placeholder
        // Structure is [Border, Inner, Text] -> index 2
        const text = this.soundBtn.children[2] as PIXI.Text;
        // Just toggle alpha or something for now as color is black
        text.alpha = isOn ? 1 : 0.5;
    }
}
