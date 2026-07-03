import { GameApp } from './core/GameApp';
import { installGameTypography } from './styles/GameTypography';

installGameTypography();

window.onload = () => {
    const app = GameApp.getInstance();
    app.init();
};
