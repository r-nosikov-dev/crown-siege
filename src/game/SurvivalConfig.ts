export const SURVIVAL = {
    CASTLE_HP: 100,
    ENEMY_DAMAGE: 10,
    BASE_ENEMY_SPEED: 144,
    GLOBAL_SPEED_SCALE: 1.05,
    SPEED_GROWTH_PER_SEC: 0.0035,
    MAX_TIME_SPEED_MULT: 2.0,
    SLOW_MULT: 0.68,
    SLOW_DURATION: 5,
    WAVE_INTERVAL_START: 4.5,
    WAVE_INTERVAL_MIN: 2.2,
    WAVE_SIZE_START: 3,
    WAVE_SIZE_MAX: 8,
    MAX_ENEMIES_START: 6,
    MAX_ENEMIES_CAP: 16,
    BOOSTER_INTERVAL_MIN: 4,
    BOOSTER_INTERVAL_MAX: 9,
    BOOSTER_FIRST_SPAWN: 3,
    SHOTGUN_AMMO: 10,
    SHOTGUN_PUMP_TIME: 0.62,
    SHOTGUN_PICKUP_CHANCE: 0.36,
    RPG_AMMO: 4,
    RPG_RADIUS: 280,
    RPG_RELOAD_TIME: 1.05,
    RPG_PICKUP_CHANCE: 0.28,
    ASSAULT_FIRE_INTERVAL: 0.09,
    ASSAULT_HEAT_PER_SHOT: 0.052,
    ASSAULT_COOL_RATE: 0.58,
    ASSAULT_OVERHEAT_COOL_RATE: 0.65,
    ASSAULT_HIT_RADIUS: 30,
    ASSAULT_SPREAD: 34,
    ASSAULT_PICKUP_CHANCE: 0.26,
    MINIGUN_FIRE_INTERVAL: 0.055,
    MINIGUN_HEAT_PER_SHOT: 0.02,
    MINIGUN_COOL_RATE: 0.72,
    MINIGUN_OVERHEAT_COOL_RATE: 0.88,
    MINIGUN_HIT_RADIUS: 28,
    MINIGUN_SPREAD: 40,
    MAX_BLOOD_STAINS: 60,
    POINTS_PER_KILL: 100,
    SCORE_HEAL_THRESHOLD: 1000,
    SCORE_HEAL_AMOUNT: 20,
} as const;

export type RatingTier = 'S' | 'A' | 'B' | 'C' | 'D';

export const RATING_THRESHOLDS: { tier: RatingTier; seconds: number; color: string; title: string }[] = [
    { tier: 'S', seconds: 180, color: '#ffd43b', title: 'LEGENDARY' },
    { tier: 'A', seconds: 120, color: '#69db7c', title: 'HEROIC' },
    { tier: 'B', seconds: 75, color: '#4dabf7', title: 'BRAVE' },
    { tier: 'C', seconds: 45, color: '#da77f2', title: 'DEFENDER' },
    { tier: 'D', seconds: 0, color: '#ff8787', title: 'RECRUIT' },
];

export function getRating(elapsedSeconds: number): { tier: RatingTier; color: string; title: string } {
    for (const r of RATING_THRESHOLDS) {
        if (elapsedSeconds >= r.seconds) {
            return { tier: r.tier, color: r.color, title: r.title };
        }
    }
    return RATING_THRESHOLDS[RATING_THRESHOLDS.length - 1];
}

export function formatTime(seconds: number): string {
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
}

export function getWaveInterval(elapsed: number): number {
    return Math.max(
        SURVIVAL.WAVE_INTERVAL_MIN,
        SURVIVAL.WAVE_INTERVAL_START - elapsed * 0.02,
    );
}

export function getWaveSize(elapsed: number): number {
    return Math.min(
        SURVIVAL.WAVE_SIZE_MAX,
        SURVIVAL.WAVE_SIZE_START + Math.floor(elapsed / 22),
    );
}

function getSpreadOffset(maxSpread: number): { x: number; y: number } {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * maxSpread;
    return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
    };
}

export function getAssaultSpreadOffset(): { x: number; y: number } {
    return getSpreadOffset(SURVIVAL.ASSAULT_SPREAD);
}

export function getMinigunSpreadOffset(): { x: number; y: number } {
    return getSpreadOffset(SURVIVAL.MINIGUN_SPREAD);
}

export type AutoWeaponType = 'assault' | 'minigun';

export function getAutoWeaponFireInterval(weapon: AutoWeaponType): number {
    return weapon === 'minigun' ? SURVIVAL.MINIGUN_FIRE_INTERVAL : SURVIVAL.ASSAULT_FIRE_INTERVAL;
}

export function getAutoWeaponHitRadius(weapon: AutoWeaponType): number {
    return weapon === 'minigun' ? SURVIVAL.MINIGUN_HIT_RADIUS : SURVIVAL.ASSAULT_HIT_RADIUS;
}

export function getMaxEnemies(elapsed: number): number {
    return Math.min(
        SURVIVAL.MAX_ENEMIES_CAP,
        SURVIVAL.MAX_ENEMIES_START + Math.floor(elapsed / 18),
    );
}