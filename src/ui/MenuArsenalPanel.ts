import * as PIXI from 'pixi.js';
import { AssetsLoader, ASSETS } from '../core/AssetsLoader';
import { SURVIVAL } from '../game/SurvivalConfig';

export interface ArsenalEntry {
    name: string;
    description: string;
    texture: PIXI.Texture;
    accent: number;
}

export function buildArsenalEntries(): ArsenalEntry[] {
    const assets = AssetsLoader.getInstance();

    return [
        {
            name: 'PISTOL',
            description: 'Tap to shoot. Default sidearm.',
            texture: assets.getTexture(ASSETS.WEAPON_PISTOL),
            accent: 0x6eb5ff,
        },
        {
            name: 'SHOTGUN',
            description: `${SURVIVAL.SHOTGUN_AMMO} shells. Double blast, pump reload.`,
            texture: assets.getTexture(ASSETS.WEAPON_SHOTGUN),
            accent: 0xffaa55,
        },
        {
            name: 'AK-47',
            description: 'Hold to fire. Heat cools fast.',
            texture: assets.getTexture(ASSETS.WEAPON_AK),
            accent: 0x88cc66,
        },
        {
            name: 'MINIGUN',
            description: 'Rapid fire. Long burst before overheat.',
            texture: assets.getTexture(ASSETS.WEAPON_MINIGUN),
            accent: 0xff66aa,
        },
        {
            name: 'RPG',
            description: `${SURVIVAL.RPG_AMMO} rockets. Massive area blast.`,
            texture: assets.getTexture(ASSETS.WEAPON_RPG),
            accent: 0xff6644,
        },
        {
            name: 'SLOW',
            description: `Goblins slower for ${SURVIVAL.SLOW_DURATION}s.`,
            texture: assets.getTexture(ASSETS.BOOST),
            accent: 0x66ccff,
        },
    ];
}