import { GameApp } from './core/GameApp';
import { loadGameFonts } from './core/FontLoader';
import { installGameTypography } from './styles/GameTypography';

installGameTypography();

window.onload = () => {
    const app = GameApp.getInstance();
    void app.init().catch((err: unknown) => {
        console.error('Failed to start game:', err);
        document.body.classList.remove('game-loading');
    });
};

void loadGameFonts();
