import { getPlayfieldSpeedScale } from '../core/Viewport';
import { SURVIVAL, getRating, RatingTier, AutoWeaponType } from './SurvivalConfig';

export type ActiveWeapon = 'pistol' | 'shotgun' | 'rpg' | 'assault' | 'minigun';

export class GameController {
    public castleHp: number;
    public castleMaxHp: number;
    public elapsedTime = 0;
    public kills = 0;
    public score = 0;
    public isPaused = false;
    public isGameOver = false;
    public slowRemaining = 0;
    public recordBannerShown = false;
    public hasShotgun = false;
    public shotgunAmmo = 0;
    public pumpRemaining = 0;
    public hasRpg = false;
    public rpgAmmo = 0;
    public rpgReloadRemaining = 0;
    public hasAssault = false;
    public hasMinigun = false;
    public assaultHeat = 0;
    public assaultOverheated = false;
    public nextScoreHealAt = SURVIVAL.SCORE_HEAL_THRESHOLD;

    private slowMultiplier = 1;

    constructor() {
        this.castleMaxHp = SURVIVAL.CASTLE_HP;
        this.castleHp = SURVIVAL.CASTLE_HP;
    }

    public reset(): void {
        this.castleHp = SURVIVAL.CASTLE_HP;
        this.elapsedTime = 0;
        this.kills = 0;
        this.score = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.slowRemaining = 0;
        this.slowMultiplier = 1;
        this.recordBannerShown = false;
        this.hasShotgun = false;
        this.shotgunAmmo = 0;
        this.pumpRemaining = 0;
        this.hasRpg = false;
        this.rpgAmmo = 0;
        this.rpgReloadRemaining = 0;
        this.hasAssault = false;
        this.hasMinigun = false;
        this.assaultHeat = 0;
        this.assaultOverheated = false;
        this.nextScoreHealAt = SURVIVAL.SCORE_HEAL_THRESHOLD;
    }

    public update(delta: number): void {
        if (this.isPaused || this.isGameOver) return;

        const dt = delta / 60;
        this.elapsedTime += dt;

        if (this.slowRemaining > 0) {
            this.slowRemaining -= dt;
            if (this.slowRemaining <= 0) {
                this.slowRemaining = 0;
                this.slowMultiplier = 1;
            }
        }

        if (this.pumpRemaining > 0) {
            this.pumpRemaining -= dt;
            if (this.pumpRemaining <= 0) this.pumpRemaining = 0;
        }

        if (this.rpgReloadRemaining > 0) {
            this.rpgReloadRemaining -= dt;
            if (this.rpgReloadRemaining <= 0) this.rpgReloadRemaining = 0;
        }
    }

    public static isAutoWeapon(weapon: ActiveWeapon): weapon is AutoWeaponType {
        return weapon === 'assault' || weapon === 'minigun';
    }

    public hasAutoWeapon(): boolean {
        return this.hasAssault || this.hasMinigun;
    }

    private getAutoHeatRates(weapon: AutoWeaponType): { coolRate: number; overheatCoolRate: number; heatPerShot: number } {
        if (weapon === 'minigun') {
            return {
                coolRate: SURVIVAL.MINIGUN_COOL_RATE,
                overheatCoolRate: SURVIVAL.MINIGUN_OVERHEAT_COOL_RATE,
                heatPerShot: SURVIVAL.MINIGUN_HEAT_PER_SHOT,
            };
        }
        return {
            coolRate: SURVIVAL.ASSAULT_COOL_RATE,
            overheatCoolRate: SURVIVAL.ASSAULT_OVERHEAT_COOL_RATE,
            heatPerShot: SURVIVAL.ASSAULT_HEAT_PER_SHOT,
        };
    }

    public updateAssaultHeat(delta: number, isFiring: boolean): void {
        const weapon = this.getActiveWeapon();
        if (!GameController.isAutoWeapon(weapon)) return;

        const dt = delta / 60;
        const rates = this.getAutoHeatRates(weapon);

        if (!isFiring || this.assaultOverheated) {
            const rate = this.assaultOverheated ? rates.overheatCoolRate : rates.coolRate;
            this.assaultHeat = Math.max(0, this.assaultHeat - rate * dt);
            if (this.assaultHeat <= 0) {
                this.assaultOverheated = false;
            }
        }
    }

    public getActiveWeapon(): ActiveWeapon {
        if (this.hasRpg && this.rpgAmmo > 0) return 'rpg';
        if (this.hasShotgun && this.shotgunAmmo > 0) return 'shotgun';
        if (this.hasMinigun) return 'minigun';
        if (this.hasAssault) return 'assault';
        return 'pistol';
    }

    public getEnemySpeedMultiplier(playHeight?: number): number {
        const timeScale = 1 + this.elapsedTime * SURVIVAL.SPEED_GROWTH_PER_SEC;
        const capped = Math.min(timeScale, SURVIVAL.MAX_TIME_SPEED_MULT);
        let mult = capped * this.slowMultiplier * SURVIVAL.GLOBAL_SPEED_SCALE;
        if (playHeight !== undefined) {
            mult *= getPlayfieldSpeedScale(playHeight);
        }
        return mult;
    }

    public applySlow(): void {
        this.slowMultiplier = SURVIVAL.SLOW_MULT;
        this.slowRemaining = SURVIVAL.SLOW_DURATION;
    }

    public applyShotgun(): void {
        this.hasShotgun = true;
        this.shotgunAmmo += SURVIVAL.SHOTGUN_AMMO;
        this.pumpRemaining = 0;
    }

    public applyRpg(): void {
        this.hasRpg = true;
        this.rpgAmmo += SURVIVAL.RPG_AMMO;
        this.rpgReloadRemaining = 0;
    }

    public applyAssault(): void {
        this.hasAssault = true;
        this.assaultHeat = 0;
        this.assaultOverheated = false;
    }

    public applyMinigun(): void {
        this.hasMinigun = true;
        this.assaultHeat = 0;
        this.assaultOverheated = false;
    }

    public canShoot(): boolean {
        if (this.isPaused || this.isGameOver) return false;
        const weapon = this.getActiveWeapon();
        if (weapon === 'shotgun' && this.pumpRemaining > 0) return false;
        if (weapon === 'rpg' && this.rpgReloadRemaining > 0) return false;
        if (GameController.isAutoWeapon(weapon) && this.assaultOverheated) return false;
        return true;
    }

    public canShootAssault(): boolean {
        const weapon = this.getActiveWeapon();
        return GameController.isAutoWeapon(weapon)
            && !this.assaultOverheated
            && this.assaultHeat < 1
            && this.canShoot();
    }

    public isPumping(): boolean {
        return this.getActiveWeapon() === 'shotgun' && this.pumpRemaining > 0;
    }

    public isRpgReloading(): boolean {
        return this.getActiveWeapon() === 'rpg' && this.rpgReloadRemaining > 0;
    }

    public isAssaultOverheated(): boolean {
        return this.hasAutoWeapon() && this.assaultOverheated;
    }

    public onShotFired(): void {
        if (!this.hasShotgun) return;
        if (this.shotgunAmmo > 0) this.shotgunAmmo--;
        if (this.shotgunAmmo <= 0) {
            this.hasShotgun = false;
            this.shotgunAmmo = 0;
            this.pumpRemaining = 0;
            return;
        }
        this.pumpRemaining = SURVIVAL.SHOTGUN_PUMP_TIME;
    }

    public onRpgFired(): void {
        if (!this.hasRpg || this.rpgAmmo <= 0) return;
        this.rpgAmmo--;
        if (this.rpgAmmo <= 0) {
            this.hasRpg = false;
            this.rpgReloadRemaining = 0;
            return;
        }
        this.rpgReloadRemaining = SURVIVAL.RPG_RELOAD_TIME;
    }

    public onAssaultShot(): void {
        const weapon = this.getActiveWeapon();
        if (!GameController.isAutoWeapon(weapon) || this.assaultOverheated) return;

        const { heatPerShot } = this.getAutoHeatRates(weapon);
        this.assaultHeat = Math.min(1, this.assaultHeat + heatPerShot);
        if (this.assaultHeat >= 1) {
            this.assaultOverheated = true;
        }
    }

    public onEnemyDestroyed(points: number): number {
        this.kills++;
        this.score += points;
        return this.tryScoreHeal();
    }

    private tryScoreHeal(): number {
        let healed = 0;

        while (this.score >= this.nextScoreHealAt) {
            this.nextScoreHealAt += SURVIVAL.SCORE_HEAL_THRESHOLD;
            if (this.castleHp < this.castleMaxHp) {
                const before = this.castleHp;
                this.healCastle(SURVIVAL.SCORE_HEAL_AMOUNT);
                healed += this.castleHp - before;
            }
        }

        return healed;
    }

    public onEnemyBreach(): void {
        this.castleHp = Math.max(0, this.castleHp - SURVIVAL.ENEMY_DAMAGE);
        if (this.castleHp <= 0) {
            this.castleHp = 0;
            this.isGameOver = true;
        }
    }

    public healCastle(amount: number): void {
        if (this.isGameOver) return;
        this.castleHp = Math.min(this.castleMaxHp, this.castleHp + amount);
    }

    public getRating(): { tier: RatingTier; color: string; title: string } {
        return getRating(this.elapsedTime);
    }
}