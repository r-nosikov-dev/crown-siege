import * as PIXI from 'pixi.js';

export class LossPopup extends PIXI.Container {
    private container: HTMLDivElement;

    constructor(width: number, height: number, onRetry: () => void, onMenu: () => void) {
        super();

        // Create HTML Container
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.justifyContent = 'center';
        this.container.style.alignItems = 'center';
        this.container.style.zIndex = '2000';

        // Title
        const title = document.createElement('h1');
        title.innerText = 'GAME OVER';
        title.style.fontFamily = "'Press Start 2P', cursive";
        title.style.color = '#ff0000';
        title.style.fontSize = '48px';
        title.style.marginBottom = '40px';
        title.style.textShadow = '4px 4px #000';
        this.container.appendChild(title);

        // Buttons Container
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '20px';
        this.container.appendChild(btnContainer);

        // Retry Button
        const retryBtn = document.createElement('button');
        retryBtn.className = 'snes-button has-ocean-color';
        retryBtn.innerText = 'Retry';
        retryBtn.style.position = 'relative';
        retryBtn.onclick = () => {
            this.destroy();
            onRetry();
        };
        btnContainer.appendChild(retryBtn);

        // Menu Button
        const menuBtn = document.createElement('button');
        menuBtn.className = 'snes-button';
        menuBtn.innerText = 'Menu';
        menuBtn.style.position = 'relative';
        menuBtn.onclick = () => {
            this.destroy();
            onMenu();
        };
        btnContainer.appendChild(menuBtn);

        document.body.appendChild(this.container);
    }

    public destroy(options?: any): void {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        super.destroy(options);
    }
}
