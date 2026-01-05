import * as PIXI from 'pixi.js';

export class WinPopup extends PIXI.Container {
    private container: HTMLDivElement;

    constructor(width: number, height: number, onNext: () => void, onMenu: () => void) {
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
        this.container.style.zIndex = '2000'; // Above UI layer

        // Title
        const title = document.createElement('h1');
        title.innerText = 'VICTORY!';
        title.style.fontFamily = "'Press Start 2P', cursive";
        title.style.color = '#ffff00';
        title.style.fontSize = '48px';
        title.style.marginBottom = '20px';
        title.style.textShadow = '4px 4px #000';
        this.container.appendChild(title);

        // Stars
        const stars = document.createElement('div');
        stars.id = 'win-stars';
        stars.style.fontFamily = "'Press Start 2P', cursive";
        stars.style.color = '#ffffff';
        stars.style.fontSize = '32px';
        stars.style.marginBottom = '40px';
        stars.style.textShadow = '2px 2px #000';
        this.container.appendChild(stars);

        // Buttons Container
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '20px';
        this.container.appendChild(btnContainer);

        // Next Level Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'snes-button has-ocean-color';
        nextBtn.innerText = 'Next Level';
        nextBtn.style.position = 'relative'; // Override absolute from class
        nextBtn.onclick = () => {
            this.destroy();
            onNext();
        };
        btnContainer.appendChild(nextBtn);

        // Menu Button
        const menuBtn = document.createElement('button');
        menuBtn.className = 'snes-button'; // Default grey
        menuBtn.innerText = 'Menu';
        menuBtn.style.position = 'relative'; // Override absolute from class
        menuBtn.onclick = () => {
            this.destroy();
            onMenu();
        };
        btnContainer.appendChild(menuBtn);

        document.body.appendChild(this.container);
    }

    public setStars(stars: number): void {
        const el = this.container.querySelector('#win-stars');
        if (el) {
            el.innerHTML = `Stars: <span style="color: gold;">${'★'.repeat(stars)}</span>`;
        }
    }

    public destroy(options?: any): void {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        super.destroy(options);
    }
}
