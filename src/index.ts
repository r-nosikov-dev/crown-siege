import { GameApp } from './core/GameApp';
import { loadGameFonts } from './core/FontLoader';
import { installGameTypography } from './styles/GameTypography';
import { LoadingScreen } from './ui/LoadingScreen';

installGameTypography();
document.body.classList.add('game-loading');
LoadingScreen.bind();
LoadingScreen.setProgress(0, 'Loading fonts...');

void loadGameFonts().then(() => {
    LoadingScreen.setPhase(0, 0.65);
});

window.onload = () => {
    const app = GameApp.getInstance();
    void app.init().catch((err: unknown) => {
        console.error('Failed to start game:', err);
        LoadingScreen.setProgress(0, 'Failed to load. Refresh the page.');
        document.body.classList.remove('game-loading');
    });
};
