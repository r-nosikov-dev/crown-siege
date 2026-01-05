import * as PIXI from 'pixi.js';

export abstract class Scene extends PIXI.Container {
    constructor() {
        super();
    }

    public abstract update(delta: number): void;
    public abstract resize(width: number, height: number): void;

    public onActivate(): void { }
    public onDeactivate(): void { }
}
