import { Scene } from './Scene';
import * as PIXI from 'pixi.js';
import { GameApp } from '../core/GameApp';
import { LevelManager } from '../game/LevelManager';
import { GameController } from '../game/GameController';
import { EnemyManager } from '../game/EnemyManager';
import { BoosterManager } from '../game/BoosterManager';
import { HUD } from '../ui/HUD';
import { WinPopup } from '../ui/WinPopup';
import { LossPopup } from '../ui/LossPopup';
import { SoundManager } from '../core/SoundManager';

export class GameScene extends Scene {
    private background: PIXI.TilingSprite;
    private levelManager: LevelManager;
    private gameController: GameController;
    private enemyManager: EnemyManager;
    private boosterManager: BoosterManager;
    private hud: HUD;
    private winPopup: WinPopup;
    private lossPopup: LossPopup;
    private currentLevelId: number = 1;

    constructor() {
        super();
        this.levelManager = new LevelManager();
        this.enemyManager = new EnemyManager();
        this.boosterManager = new BoosterManager();
        this.hud = new HUD();

        this.levelManager = new LevelManager();
        this.enemyManager = new EnemyManager();
        this.boosterManager = new BoosterManager();
        this.hud = new HUD();

        this.background = new PIXI.TilingSprite(PIXI.Texture.EMPTY);
        this.addChildAt(this.background, 0);

        this.addChild(this.boosterManager);
        this.addChild(this.enemyManager);
        this.addChild(this.hud);

        this.boosterManager.on('boosterCollected', (amount: number) => {
            if (this.gameController && !this.gameController.isGameOver) {
                this.gameController.addTime(amount);
                this.hud.updateTime(this.gameController.timeRemaining);
            }
        });

        this.enemyManager.on('enemyClicked', (enemy: any) => {
            if (this.gameController && !this.gameController.isGameOver && !this.gameController.isPaused) {
                SoundManager.getInstance().play('shot');
                SoundManager.getInstance().play('death_orc');
                this.enemyManager.destroyEnemy(enemy);
                this.gameController.onEnemyDestroyed();
                this.hud.updateScore(this.gameController.enemiesDestroyed, this.gameController.level.enemies.length);

                if (this.gameController.isGameOver && this.gameController.enemiesRemaining === 0) {
                    this.showWin();
                }
            }
        });

        this.hud.onPauseClick(() => {
            if (!this.gameController.isGameOver) {
                this.gameController.isPaused = !this.gameController.isPaused;
            }
        });

        this.hud.onSoundClick(() => {
            const isMuted = SoundManager.getInstance().toggleMute();
            this.hud.setSoundText(!isMuted);
        });
    }

    public onActivate(): void {
        this.startLevel(1);
    }

    public onDeactivate(): void {
        this.enemyManager.clearEnemies();
        this.boosterManager.clear();
    }


    public async startLevel(id: number): Promise<void> {
        this.currentLevelId = id;
        const levelConfig = this.levelManager.getLevel(id);
        if (!levelConfig) {
            console.error('Level not found');
            return;
        }

        // Preload assets
        if (!PIXI.Assets.cache.has('orc')) {
            await PIXI.Assets.load({ alias: 'orc', src: 'assets/images/enemies/orc_list.png' });
        }
        if (!PIXI.Assets.cache.has('orc_death')) {
            await PIXI.Assets.load({ alias: 'orc_death', src: 'assets/images/enemies/orc_death.png' });
        }
        if (!PIXI.Assets.cache.has('background')) {
            await PIXI.Assets.load({ alias: 'background', src: 'assets/images/environment/background.jpg' });
        }
        if (!PIXI.Assets.cache.has('boost_collectible')) {
            await PIXI.Assets.load({ alias: 'boost_collectible', src: 'assets/images/collectibles/boost.png' });
        }

        // Set custom cursor globally for Pixi
        const aimCursor = "url('assets/images/ui/aim.png') 16 16, auto";
        (GameApp.getInstance().app.renderer.events as any).cursorStyles.default = aimCursor;
        (GameApp.getInstance().app.renderer.events as any).cursorStyles.hover = aimCursor;

        // Also set CSS for the canvas directly as a fallback
        (GameApp.getInstance().app.canvas as HTMLCanvasElement).style.cursor = aimCursor;

        // Set background texture
        this.background.texture = PIXI.Assets.get('background');
        this.background.width = window.innerWidth;
        this.background.height = window.innerHeight;

        this.gameController = new GameController(levelConfig);
        this.enemyManager.spawnEnemies(levelConfig.enemies);
        this.hud.updateTime(this.gameController.timeRemaining);
        this.hud.updateScore(0, levelConfig.enemies.length);
        this.boosterManager.clear();

        // Start BGM
        SoundManager.getInstance().play('bgm');

        if (this.winPopup) {
            this.winPopup.destroy();
            this.winPopup = null as any;
        }
        if (this.lossPopup) {
            this.lossPopup.destroy();
            this.lossPopup = null as any;
        }
    }

    public destroy(options?: any): void {
        // Reset cursor
        (GameApp.getInstance().app.renderer.events as any).cursorStyles.default = 'default';
        (GameApp.getInstance().app.renderer.events as any).cursorStyles.hover = 'pointer';
        (GameApp.getInstance().app.canvas as HTMLCanvasElement).style.cursor = 'default';
        super.destroy(options);
    }

    private showWin(): void {
        SoundManager.getInstance().play('win');
        const stars = this.gameController.getStars();
        this.winPopup = new WinPopup(window.innerWidth, window.innerHeight,
            () => {
                if (this.currentLevelId < this.levelManager.getTotalLevels()) {
                    this.startLevel(this.currentLevelId + 1);
                } else {
                    GameApp.getInstance().sceneManager.switchTo('menu');
                }
            },
            () => GameApp.getInstance().sceneManager.switchTo('menu')
        );
        this.winPopup.setStars(stars);
        this.addChild(this.winPopup);
    }

    private showLoss(): void {
        SoundManager.getInstance().play('loss');
        this.lossPopup = new LossPopup(window.innerWidth, window.innerHeight,
            () => this.startLevel(this.currentLevelId),
            () => GameApp.getInstance().sceneManager.switchTo('menu')
        );
        this.addChild(this.lossPopup);
    }

    public update(delta: number): void {
        if (!this.gameController || this.gameController.isGameOver) return;

        this.gameController.update(delta);
        this.hud.updateTime(this.gameController.timeRemaining);

        if (!this.gameController.isPaused) {
            const bounds = { width: window.innerWidth, height: window.innerHeight - this.hud.hudHeight };
            this.enemyManager.update(delta, bounds);
            this.boosterManager.update(delta, bounds);
        }

        if (this.gameController.isGameOver && this.gameController.timeRemaining === 0) {
            this.showLoss();
        }
    }

    public resize(width: number, height: number): void {
        if (this.background) {
            this.background.width = width;
            this.background.height = height;
        }

        this.hud.resize(width, height);

        this.enemyManager.y = this.hud.hudHeight;
        this.enemyManager.resize(width, height - this.hud.hudHeight);
        this.boosterManager.resize(width, height - this.hud.hudHeight);
    }
}
