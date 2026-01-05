import { GameApp } from './core/GameApp';

window.onload = () => {
    const app = GameApp.getInstance();
    app.init();
};
