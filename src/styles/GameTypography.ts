import type * as PIXI from 'pixi.js';

export const FONT_FAMILY = 'Press Start 2P';
export const FONT_FAMILY_CSS = "'Press Start 2P', cursive";

const STYLE_ID = 'game-typography';

export const TEXT_COLORS = {
    white: 0xffffff,
    black: 0x000000,
    gold: 0xffe066,
    goldLight: 0xfff3bf,
    sky: 0xd0ebff,
    skyPale: 0xe8f4ff,
    gray: 0x888888,
    grayLight: 0xaaaaaa,
    green: 0x69db7c,
    score: 0xffdd44,
    red: 0xff0000,
    yellow: 0xffff00,
    cyan: 0x44ffee,
    lavender: 0xb8c0ff,
    danger: 0xff6666,
    dark: 0x1a1a2e,
    darkMuted: 0x3d3d5c,
} as const;

export function menuTitleGlowStyle(fontSize = 36): Partial<PIXI.TextStyle> {
    return {
        fontFamily: FONT_FAMILY,
        fontSize,
        fill: TEXT_COLORS.gold,
        align: 'center',
    };
}

export function menuTitleStyle(fontSize = 36): Partial<PIXI.TextStyle> {
    return {
        fontFamily: FONT_FAMILY,
        fontSize,
        fill: TEXT_COLORS.white,
        align: 'center',
        dropShadow: {
            alpha: 0.7,
            angle: Math.PI / 2,
            blur: 6,
            color: 0x003366,
            distance: 3,
        },
    };
}

export function menuSubtitleStyle(fontSize = 11): Partial<PIXI.TextStyle> {
    return {
        fontFamily: FONT_FAMILY,
        fontSize,
        fill: TEXT_COLORS.goldLight,
        align: 'center',
    };
}

export function menuTaglineStyle(fontSize = 8, lineHeight = 14): Partial<PIXI.TextStyle> {
    return {
        fontFamily: FONT_FAMILY,
        fontSize,
        fill: TEXT_COLORS.sky,
        align: 'center',
        lineHeight,
    };
}

export function hudLabelStyle(fontSize: number): Partial<PIXI.TextStyle> {
    return { fontFamily: FONT_FAMILY, fontSize, fill: TEXT_COLORS.gray };
}

export function hudValueStyle(fontSize: number): Partial<PIXI.TextStyle> {
    return { fontFamily: FONT_FAMILY, fontSize, fill: TEXT_COLORS.white };
}

export function hudButtonStyle(fontSize: number): Partial<PIXI.TextStyle> {
    return { fontFamily: FONT_FAMILY, fontSize, fill: TEXT_COLORS.black };
}

export function castleHpStyle(fontSize = 7): Partial<PIXI.TextStyle> {
    return {
        fontFamily: FONT_FAMILY,
        fontSize,
        fill: TEXT_COLORS.white,
        stroke: { color: TEXT_COLORS.black, width: 2 },
    };
}

export function castleMissionStyle(fontSize = 10, lineHeight = 16): Partial<PIXI.TextStyle> {
    return {
        fontFamily: FONT_FAMILY,
        fontSize,
        fill: TEXT_COLORS.gold,
        align: 'center',
        stroke: { color: TEXT_COLORS.black, width: 3 },
        lineHeight,
    };
}

export function floatingScoreStyle(): Partial<PIXI.TextStyle> {
    return {
        fontFamily: FONT_FAMILY,
        fontSize: 14,
        fill: TEXT_COLORS.score,
        stroke: { color: TEXT_COLORS.black, width: 3 },
        dropShadow: {
            alpha: 0.8,
            angle: Math.PI / 4,
            blur: 2,
            color: TEXT_COLORS.black,
            distance: 2,
        },
    };
}

export function castleHealStyle(): Partial<PIXI.TextStyle> {
    return {
        fontFamily: FONT_FAMILY,
        fontSize: 13,
        fill: TEXT_COLORS.green,
        stroke: { color: TEXT_COLORS.black, width: 3 },
        dropShadow: {
            alpha: 0.8,
            angle: Math.PI / 4,
            blur: 2,
            color: TEXT_COLORS.black,
            distance: 2,
        },
    };
}

export function boosterCollectStyle(
    suffix: string,
): Partial<PIXI.TextStyle> {
    const isShotgun = suffix === 'SHOTGUN';
    const isRpg = suffix === 'RPG';
    const isAk = suffix === 'AK';

    return {
        fontFamily: FONT_FAMILY,
        fontSize: suffix === 'SLOW' ? 11 : isShotgun || isRpg || isAk ? 10 : 13,
        fill: suffix === 'SLOW'
            ? 0x66ccff
            : isShotgun
                ? 0xffaa66
                : isRpg
                    ? 0xff6644
                    : isAk
                        ? 0x88cc66
                        : TEXT_COLORS.cyan,
        stroke: {
            color: suffix === 'SLOW'
                ? 0x339af0
                : isShotgun
                    ? 0xcc6622
                    : isRpg
                        ? 0xaa2200
                        : isAk
                            ? 0x446622
                            : TEXT_COLORS.score,
            width: 3,
        },
        dropShadow: {
            alpha: 0.9,
            angle: Math.PI / 2,
            blur: 3,
            color: 0x003344,
            distance: 2,
        },
    };
}

export function popupButtonLabelStyle(): Partial<PIXI.TextStyle> {
    return { fontFamily: FONT_FAMILY, fontSize: 20, fill: TEXT_COLORS.black };
}

export const TYPOGRAPHY_CSS = `
.snes-button {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(10px, 2.5vw, 16px);
    color: var(--text-color);
}

.rating-popup__close {
    color: #fff;
    font-size: 22px;
}

.rating-popup__header {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(10px, 2.8vw, 13px);
    color: #fff3bf;
}

.rating-popup__section-title {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(7px, 2vw, 9px);
    color: #d0ebff;
}

.rating-popup__table {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(6px, 1.7vw, 8px);
    color: #fff;
}

.rating-popup__table th {
    color: #fff3bf;
}

.rating-popup__row--best td {
    color: #ffe066;
}

.rating-popup__empty-row td {
    color: #d0ebff;
}

.rating-popup__date {
    color: #a5d8ff;
    font-size: clamp(5px, 1.5vw, 7px);
}

.rating-popup__tier-row td:first-child {
    font-size: clamp(9px, 2.5vw, 12px);
}

.arsenal-info-popup__close {
    color: #fff;
    font-size: 22px;
}

.arsenal-info-popup__header {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(9px, 2.6vw, 12px);
    color: #fff3bf;
}

.arsenal-info-popup__name {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(6px, 1.8vw, 8px);
    color: var(--accent, #fff);
}

.arsenal-info-popup__desc {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(5px, 1.5vw, 6px);
    color: #e8f4ff;
}

.record-banner__text {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(11px, 3.5vw, 18px);
    color: #1a1a2e;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}

.record-banner__sub {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(7px, 2vw, 10px);
    color: #3d3d5c;
}

.overheat-bar__label {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(5px, 1.4vw, 7px);
    color: #000;
    letter-spacing: 1px;
}

.overheat-bar--danger .overheat-bar__label {
    color: #000;
}

.booster-toast {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(6px, 1.7vw, 8px);
    color: #b8e0ff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.result-popup__header {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(14px, 4vw, 22px);
    color: #ff6b6b;
    text-shadow: 0 2px 8px rgba(255, 0, 0, 0.3);
}

.result-popup__record {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(8px, 2.2vw, 11px);
    color: #1a1a2e;
}

.result-popup__tier {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(48px, 14vw, 80px);
    text-shadow: 0 4px 24px currentColor;
}

.result-popup__tier-title {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(9px, 2.5vw, 12px);
}

.result-popup__stat-label {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(6px, 1.8vw, 8px);
    color: #888;
}

.result-popup__stat-value {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(10px, 3vw, 14px);
    color: #fff;
}

.settings-popup__close {
    color: #ccc;
    font-size: 22px;
}

.settings-popup__close:hover {
    color: #fff;
}

.settings-popup__header {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(12px, 3.5vw, 16px);
    color: #b8c0ff;
}

.settings-popup__section-title {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(7px, 2vw, 9px);
    color: #888;
    letter-spacing: 1px;
}

.settings-popup__label {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(7px, 2vw, 8px);
    color: #aaa;
}

.settings-popup__mute {
    font-size: clamp(8px, 2.2vw, 10px) !important;
}

.settings-popup__volume-value {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(7px, 2vw, 8px);
    color: #fff;
}

.intro-popup__header {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(10px, 2.8vw, 13px);
    color: #fff3bf;
}

.intro-popup__line {
    font-family: ${FONT_FAMILY_CSS};
    font-size: clamp(7px, 2.1vw, 9px);
    color: #d0ebff;
}

.intro-popup__btn {
    font-family: ${FONT_FAMILY_CSS};
}
`;

export function installGameTypography(): void {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = TYPOGRAPHY_CSS;
    document.head.appendChild(style);
}