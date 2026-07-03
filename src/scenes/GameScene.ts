import { Scene } from './Scene';
import * as PIXI from 'pixi.js';
import { GameApp } from '../core/GameApp';
import { AssetsLoader, ASSETS } from '../core/AssetsLoader';
import { GameController } from '../game/GameController';
import { EnemyManager } from '../game/EnemyManager';
import { BoosterManager, PickupType } from '../game/BoosterManager';
import { Castle } from '../entities/Castle';
import { Enemy } from '../entities/Enemy';
import { GameBooster } from '../entities/GameBooster';
import { HUD } from '../ui/HUD';
import { ResultPopup } from '../ui/ResultPopup';
import { SettingsPopup } from '../ui/SettingsPopup';
import { SoundManager } from '../core/SoundManager';
import { HighScore } from '../core/HighScore';
import { spawnCastleHealPopup } from '../effects/CastleHealPopup';
import { spawnFloatingScore } from '../effects/FloatingScore';
import { showBoosterToast } from '../effects/BoosterToast';
import { spawnBulletMark } from '../effects/BulletMark';
import { spawnBloodStain, trimBloodStains } from '../effects/BloodStain';
import { playRpgExplosion } from '../effects/RpgExplosion';
import { ExplosionFlashController } from '../effects/ExplosionFlash';
import { showRecordBanner } from '../effects/RecordBanner';
import { showOverheatBar, hideOverheatBar, updateOverheatBar } from '../ui/OverheatBar';
import {
    SURVIVAL,
    getWaveInterval,
    getWaveSize,
    getMaxEnemies,
    getAssaultSpreadOffset,
    getMinigunSpreadOffset,
    getAutoWeaponFireInterval,
    getAutoWeaponHitRadius,
    AutoWeaponType,
} from '../game/SurvivalConfig';
import { getPlayfieldEntityScale } from '../core/Viewport';

export class GameScene extends Scene {
    private gameWorld: PIXI.Container;
    private background: PIXI.TilingSprite;
    private playLayer: PIXI.Container;
    private effectsLayer: PIXI.Container;
    private explosionFlash: ExplosionFlashController | null = null;
    private castle: Castle | null = null;
    private gameController: GameController | null = null;
    private enemyManager: EnemyManager;
    private boosterManager: BoosterManager;
    private hud: HUD;
    private resultPopup: ResultPopup | null = null;
    private settingsPopup: SettingsPopup | null = null;
    private pausedForSettings = false;

    private spawnTimer = 0;
    private bestTime = 0;
    private screenWidth = 0;
    private screenHeight = 0;
    private isHoldingFire = false;
    private aimX = 0;
    private aimY = 0;
    private assaultFireTimer = 0;
    private releaseFireHandler: (() => void) | null = null;

    constructor() {
        super();
        this.enemyManager = new EnemyManager();
        this.boosterManager = new BoosterManager();
        this.hud = new HUD();
        this.gameWorld = new PIXI.Container();
        this.playLayer = new PIXI.Container();
        this.effectsLayer = new PIXI.Container();

        this.background = new PIXI.TilingSprite(PIXI.Texture.EMPTY);
        this.background.eventMode = 'none';
        this.gameWorld.addChild(this.background);
        this.gameWorld.addChild(this.playLayer);
        this.addChild(this.gameWorld);
        this.addChild(this.hud);

        this.playLayer.sortableChildren = true;
        this.effectsLayer.zIndex = 0;
        this.enemyManager.zIndex = 10;
        this.boosterManager.zIndex = 15;
        this.playLayer.addChild(this.effectsLayer);
        this.playLayer.addChild(this.enemyManager);
        this.playLayer.addChild(this.boosterManager);

        this.explosionFlash = new ExplosionFlashController(this.gameWorld);
        this.setupPlayInput();

        this.boosterManager.on('pickupCollected', (type: PickupType) => {
            if (!this.gameController || this.gameController.isGameOver) return;

            SoundManager.getInstance().play('bonus');

            if (type === 'slow') {
                this.gameController.applySlow();
                showBoosterToast(`Slow: goblins slower for ${SURVIVAL.SLOW_DURATION}s`);
            } else if (type === 'shotgun') {
                this.gameController.applyShotgun();
                showBoosterToast(`Shotgun: ${SURVIVAL.SHOTGUN_AMMO} shells, pump-action`);
            } else if (type === 'assault') {
                this.gameController.applyAssault();
                showBoosterToast('AK-47: hold fire, watch heat');
                showOverheatBar(true);
            } else if (type === 'minigun') {
                this.gameController.applyMinigun();
                showBoosterToast('Minigun: rapid fire, watch heat');
                showOverheatBar(true);
            } else {
                this.gameController.applyRpg();
                showBoosterToast(`RPG: ${SURVIVAL.RPG_AMMO} rockets, area blast`);
            }
            this.refreshWeaponHud();
            this.refreshOverheatBar();
        });

        this.enemyManager.on('enemyClicked', (enemy: Enemy) => {
            if (!this.gameController || this.gameController.isGameOver || this.gameController.isPaused) {
                return;
            }
            if (!this.gameController.canShoot()) return;

            const weapon = this.gameController.getActiveWeapon();

            if (weapon === 'rpg') {
                const local = this.effectsLayer.toLocal(enemy.getGlobalPosition());
                this.fireRpg(local.x, local.y);
                return;
            }

            if (GameController.isAutoWeapon(weapon)) {
                const local = this.effectsLayer.toLocal(enemy.getGlobalPosition());
                this.fireAutoShot(weapon, local.x, local.y);
                return;
            }

            this.killEnemy(enemy);
        });

        this.hud.onPauseClick(() => {
            if (this.gameController && !this.gameController.isGameOver) {
                this.gameController.isPaused = !this.gameController.isPaused;
                if (this.gameController.isPaused) this.stopHoldingFire();
            }
        });

        this.hud.onSoundClick(() => {
            const isMuted = SoundManager.getInstance().toggleMute();
            this.hud.setSoundText(!isMuted);
        });

        this.hud.onSettingsClick(() => this.openSettings());
    }

    public onActivate(): void {
        this.startGame();
    }

    public onDeactivate(): void {
        this.stopHoldingFire();
        this.enemyManager.clearEnemies();
        this.boosterManager.clear();
        hideOverheatBar();
        this.destroyPopups();
    }

    public startGame(): void {
        this.stopHoldingFire();
        this.setAimCursor();
        this.bestTime = HighScore.load();

        const assets = AssetsLoader.getInstance();
        this.background.texture = assets.getTexture(ASSETS.BACKGROUND);
        this.background.width = this.screenWidth;
        this.background.height = this.screenHeight;

        this.setupCastle(assets.getTexture(ASSETS.CASTLE));

        this.gameController = new GameController();
        this.spawnTimer = 0;
        this.assaultFireTimer = 0;

        const playBounds = this.getPlayBounds();
        this.updatePlayHitArea(playBounds.width, playBounds.height);
        this.castle!.layout(playBounds.width, playBounds.height);
        this.hud.updateTime(0);
        this.castle?.updateHp(this.gameController.castleHp, this.gameController.castleMaxHp);
        this.hud.updateKills(0);
        this.hud.updateScore(0, this.gameController.nextScoreHealAt);
        this.hud.setSoundText(!SoundManager.getInstance().isMuted());
        this.refreshWeaponHud();
        hideOverheatBar();

        this.enemyManager.clearEnemies();
        this.boosterManager.reset();
        this.effectsLayer.removeChildren();

        this.destroyPopups();
    }

    private setupCastle(texture: PIXI.Texture): void {
        if (this.castle) {
            this.playLayer.removeChild(this.castle);
            this.castle.destroy();
        }
        this.castle = new Castle(texture);
        this.castle.zIndex = 25;
        this.playLayer.addChild(this.castle);
    }

    private setupPlayInput(): void {
        this.playLayer.eventMode = 'static';

        this.playLayer.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
            if (!this.gameController || this.gameController.isGameOver || this.gameController.isPaused) {
                return;
            }
            if (this.isPickupOrEnemyClick(e.target)) return;

            const local = this.effectsLayer.toLocal(e.global);
            this.aimX = local.x;
            this.aimY = local.y;

            const weapon = this.gameController.getActiveWeapon();

            if (GameController.isAutoWeapon(weapon)) {
                this.isHoldingFire = true;
                this.bindReleaseFire();
                if (this.gameController.canShootAssault()) {
                    this.fireAutoShot(weapon, local.x, local.y);
                    this.assaultFireTimer = getAutoWeaponFireInterval(weapon);
                }
                return;
            }

            if (!this.gameController.canShoot()) return;

            if (weapon === 'rpg') {
                this.fireRpg(local.x, local.y);
                return;
            }

            const isShotgun = weapon === 'shotgun';
            spawnBulletMark(this.effectsLayer, local.x, local.y, {
                double: isShotgun,
                excludeRect: this.getCastleExclusionRect(),
            });
            SoundManager.getInstance().play(isShotgun ? 'shootgun' : 'shot');

            if (isShotgun) {
                this.gameController.onShotFired();
                this.refreshWeaponHud();
            }
        });

        this.playLayer.on('pointermove', (e: PIXI.FederatedPointerEvent) => {
            if (!this.isHoldingFire) return;
            const local = this.effectsLayer.toLocal(e.global);
            this.aimX = local.x;
            this.aimY = local.y;
        });
    }

    private bindReleaseFire(): void {
        if (this.releaseFireHandler) return;

        this.releaseFireHandler = () => this.stopHoldingFire();
        window.addEventListener('pointerup', this.releaseFireHandler);
        window.addEventListener('pointercancel', this.releaseFireHandler);
    }

    private unbindReleaseFire(): void {
        if (!this.releaseFireHandler) return;
        window.removeEventListener('pointerup', this.releaseFireHandler);
        window.removeEventListener('pointercancel', this.releaseFireHandler);
        this.releaseFireHandler = null;
    }

    private stopHoldingFire(): void {
        this.isHoldingFire = false;
        this.unbindReleaseFire();
    }

    private fireAutoShot(weapon: AutoWeaponType, x: number, y: number): void {
        if (!this.gameController?.canShootAssault()) return;

        this.gameController.onAssaultShot();
        SoundManager.getInstance().play(weapon === 'minigun' ? 'minigun' : 'assault');

        const spread = weapon === 'minigun' ? getMinigunSpreadOffset() : getAssaultSpreadOffset();
        const shotX = x + spread.x;
        const shotY = y + spread.y;

        const hitRadius = getAutoWeaponHitRadius(weapon) * getPlayfieldEntityScale();
        const enemy = this.enemyManager.getEnemyAtPoint(shotX, shotY, hitRadius);
        if (enemy) {
            this.killEnemy(enemy, undefined, undefined, true);
        } else {
            spawnBulletMark(this.effectsLayer, shotX, shotY, {
                excludeRect: this.getCastleExclusionRect(),
            });
        }

        this.refreshWeaponHud();
        this.refreshOverheatBar();
    }

    private processAssaultFire(delta: number): void {
        if (!this.gameController?.hasAutoWeapon()) return;

        this.gameController.updateAssaultHeat(delta, this.isHoldingFire);
        this.refreshOverheatBar();

        if (!this.isHoldingFire) return;

        const weapon = this.gameController.getActiveWeapon();
        if (!GameController.isAutoWeapon(weapon)) return;

        this.assaultFireTimer -= delta / 60;
        if (this.assaultFireTimer > 0) return;

        if (this.gameController.canShootAssault()) {
            this.fireAutoShot(weapon, this.aimX, this.aimY);
            this.assaultFireTimer = getAutoWeaponFireInterval(weapon);
        } else {
            this.stopHoldingFire();
        }
    }

    private fireRpg(x: number, y: number): void {
        if (!this.gameController) return;

        SoundManager.getInstance().play('rpg');
        this.gameController.onRpgFired();

        const radius = SURVIVAL.RPG_RADIUS;
        const global = this.effectsLayer.toGlobal({ x, y });
        this.explosionFlash?.trigger(global.x, global.y, radius);
        playRpgExplosion(this.effectsLayer, x, y, radius);

        const victims = [...this.enemyManager.getEnemiesInRadius(x, y, radius)];
        victims.forEach(enemy => this.killEnemy(enemy, x, y));

        this.refreshWeaponHud();
    }

    private killEnemy(
        enemy: Enemy,
        blastX?: number,
        blastY?: number,
        skipWeaponSound = false,
    ): void {
        if (!this.gameController) return;

        const weapon = this.gameController.getActiveWeapon();

        if (!skipWeaponSound && weapon !== 'rpg') {
            if (weapon === 'assault') {
                SoundManager.getInstance().play('assault');
                this.gameController.onAssaultShot();
            } else if (weapon === 'minigun') {
                SoundManager.getInstance().play('minigun');
                this.gameController.onAssaultShot();
            } else if (weapon === 'shotgun') {
                SoundManager.getInstance().play('shootgun');
                this.gameController.onShotFired();
            } else {
                SoundManager.getInstance().play('shot');
            }
            SoundManager.getInstance().play('death_orc');
        } else if (weapon === 'rpg') {
            SoundManager.getInstance().play('death_orc');
        } else if (skipWeaponSound) {
            SoundManager.getInstance().play('death_orc');
        }

        const killGlobal = enemy.getGlobalPosition();
        const killLocal = this.effectsLayer.toLocal(killGlobal);
        const stainX = blastX ?? killLocal.x;
        const stainY = blastY ?? killLocal.y;

        const excludeRect = this.getCastleExclusionRect();
        spawnBloodStain(
            this.effectsLayer,
            stainX + (Math.random() - 0.5) * 14,
            stainY + (Math.random() - 0.5) * 10,
            excludeRect,
        );
        if (Math.random() < 0.45) {
            spawnBloodStain(
                this.effectsLayer,
                stainX + (Math.random() - 0.5) * 28,
                stainY + (Math.random() - 0.5) * 22,
                excludeRect,
            );
        }
        trimBloodStains(this.effectsLayer, SURVIVAL.MAX_BLOOD_STAINS);

        spawnFloatingScore(this, killGlobal.x, killGlobal.y, SURVIVAL.POINTS_PER_KILL);
        this.enemyManager.destroyEnemy(enemy);
        const healed = this.gameController.onEnemyDestroyed(SURVIVAL.POINTS_PER_KILL);
        this.hud.updateKills(this.gameController.kills);
        this.hud.updateScore(this.gameController.score, this.gameController.nextScoreHealAt);
        if (healed > 0) {
            this.castle?.updateHp(this.gameController.castleHp, this.gameController.castleMaxHp);
            const castleGlobal = this.castle?.getGlobalPosition();
            if (castleGlobal) {
                spawnCastleHealPopup(this, castleGlobal.x, castleGlobal.y - 24, healed);
            }
            showBoosterToast(`CASTLE +${healed} HP!`);
        }
        this.refreshWeaponHud();
        this.refreshOverheatBar();
    }

    private isPickupOrEnemyClick(target: unknown): boolean {
        let node = target as PIXI.Container | null;
        while (node && node !== this.playLayer) {
            if (node instanceof Enemy || node instanceof GameBooster) return true;
            node = node.parent;
        }
        return false;
    }

    private refreshOverheatBar(): void {
        if (!this.gameController?.hasAutoWeapon()) {
            hideOverheatBar();
            return;
        }
        showOverheatBar(true);
        updateOverheatBar(this.gameController.assaultHeat, this.gameController.isAssaultOverheated());
    }

    private refreshWeaponHud(): void {
        if (!this.gameController) return;
        const weapon = this.gameController.getActiveWeapon();
        const ammo = weapon === 'rpg'
            ? this.gameController.rpgAmmo
            : weapon === 'shotgun'
                ? this.gameController.shotgunAmmo
                : 0;
        const status = this.gameController.isAssaultOverheated()
            ? 'overheat'
            : this.gameController.isPumping()
                ? 'pump'
                : this.gameController.isRpgReloading()
                    ? 'reload'
                    : 'ready';
        this.hud.updateWeapon(weapon, ammo, status);
    }

    private updatePlayHitArea(width: number, height: number): void {
        this.playLayer.hitArea = new PIXI.Rectangle(0, 0, width, height);
    }

    private getPlayBounds(): { width: number; height: number } {
        return {
            width: this.screenWidth,
            height: this.screenHeight - this.hud.hudHeight,
        };
    }

    private getCastleExclusionRect(): PIXI.Rectangle | undefined {
        return this.castle?.getEffectsExclusionRect();
    }

    private getCastleCenter(): { x: number; y: number; radius: number } {
        const bounds = this.getPlayBounds();
        return {
            x: bounds.width / 2,
            y: bounds.height / 2,
            radius: this.castle?.getHitRadius() ?? 36,
        };
    }

    private setAimCursor(): void {
        const aimCursor = AssetsLoader.getInstance().getAimCursor();
        const events = GameApp.getInstance().app.renderer.events as PIXI.EventSystem & {
            cursorStyles: Record<string, string>;
        };
        events.cursorStyles.default = aimCursor;
        events.cursorStyles.hover = aimCursor;
        (GameApp.getInstance().app.canvas as HTMLCanvasElement).style.cursor = aimCursor;
    }

    private openSettings(): void {
        if (this.settingsPopup) return;

        if (this.gameController && !this.gameController.isGameOver && !this.gameController.isPaused) {
            this.gameController.isPaused = true;
            this.pausedForSettings = true;
            this.stopHoldingFire();
        } else {
            this.pausedForSettings = false;
        }

        this.settingsPopup = new SettingsPopup({
            onClose: () => {
                this.settingsPopup = null;
                if (this.pausedForSettings && this.gameController && !this.gameController.isGameOver) {
                    this.gameController.isPaused = false;
                }
                this.pausedForSettings = false;
            },
            onSoundChange: () => {
                this.hud.setSoundText(!SoundManager.getInstance().isMuted());
            },
        });
    }

    private destroyPopups(): void {
        if (this.settingsPopup) {
            this.settingsPopup.destroy();
            this.settingsPopup = null;
            this.pausedForSettings = false;
        }
        if (this.resultPopup) {
            this.resultPopup.destroy();
            this.resultPopup = null;
        }
    }

    private checkRecord(): void {
        if (!this.gameController || this.gameController.recordBannerShown) return;
        if (this.bestTime > 0 && this.gameController.elapsedTime > this.bestTime) {
            this.gameController.recordBannerShown = true;
            showRecordBanner();
        }
    }

    private showResult(): void {
        if (this.resultPopup || !this.gameController) return;

        const elapsed = this.gameController.elapsedTime;
        const isNewRecord = HighScore.isNewRecord(elapsed);
        HighScore.saveRun(elapsed, this.gameController.kills, this.gameController.score);
        const bestTime = HighScore.load();
        const rating = this.gameController.getRating();

        this.resultPopup = new ResultPopup(
            {
                elapsed,
                kills: this.gameController.kills,
                score: this.gameController.score,
                tier: rating.tier,
                tierColor: rating.color,
                tierTitle: rating.title,
                bestTime,
                isNewRecord,
            },
            () => this.startGame(),
            () => GameApp.getInstance().sceneManager.switchTo('menu'),
        );
        this.addChild(this.resultPopup);
    }

    public update(delta: number): void {
        if (!this.gameController || this.gameController.isGameOver || !this.castle) return;

        if (!this.gameController.isPaused) {
            this.gameController.update(delta);
            this.processAssaultFire(delta);
            this.hud.updateTime(this.gameController.elapsedTime);
            this.refreshWeaponHud();
            this.checkRecord();

            const playBounds = this.getPlayBounds();
            const speedMult = this.gameController.getEnemySpeedMultiplier(playBounds.height);
            this.enemyManager.applySpeedMultiplier(speedMult);
            const elapsed = this.gameController.elapsedTime;
            const maxEnemies = getMaxEnemies(elapsed);
            const enemyCount = this.enemyManager.getEnemyCount();

            this.spawnTimer += delta / 60;
            if (this.spawnTimer >= getWaveInterval(elapsed) && enemyCount < maxEnemies) {
                const waveSize = Math.min(getWaveSize(elapsed), maxEnemies - enemyCount);
                if (waveSize > 0) {
                    this.enemyManager.spawnWave(playBounds.width, playBounds.height, speedMult, waveSize);
                    this.spawnTimer = 0;
                }
            }

            this.boosterManager.update(delta, playBounds);

            const castle = this.getCastleCenter();
            const breached = this.enemyManager.update(delta, castle.x, castle.y, castle.radius);
            breached.forEach(enemy => {
                this.enemyManager.removeEnemyImmediate(enemy);
                this.gameController!.onEnemyBreach();
                this.castle?.shake();
                this.castle?.updateHp(this.gameController!.castleHp, this.gameController!.castleMaxHp);
            });

            if (this.gameController.isGameOver) {
                this.stopHoldingFire();
                hideOverheatBar();
                this.showResult();
            }
        }
    }

    public resize(width: number, height: number): void {
        this.screenWidth = width;
        this.screenHeight = height;

        this.background.width = width;
        this.background.height = height;
        this.hud.resize(width, height);

        const playHeight = Math.max(0, height - this.hud.hudHeight);
        this.playLayer.y = this.hud.hudHeight;
        this.updatePlayHitArea(width, playHeight);
        this.castle?.layout(width, playHeight);
        this.enemyManager.resize(width, playHeight);
        this.boosterManager.resize(width, playHeight);
    }

    public destroy(options?: PIXI.DestroyOptions): void {
        this.stopHoldingFire();
        hideOverheatBar();
        this.explosionFlash?.destroy();
        this.explosionFlash = null;
        const events = GameApp.getInstance().app.renderer.events as PIXI.EventSystem & {
            cursorStyles: Record<string, string>;
        };
        events.cursorStyles.default = 'default';
        (GameApp.getInstance().app.canvas as HTMLCanvasElement).style.cursor = 'default';
        super.destroy(options);
    }
}