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
    return { fontFamily: FONT_FAMILY, fontSize, fill: TEXT_COLORS.white };
}

export function hudValueStyle(fontSize: number): Partial<PIXI.TextStyle> {
    return { fontFamily: FONT_FAMILY, fontSize, fill: TEXT_COLORS.white };
}

export function hudButtonStyle(fontSize: number): Partial<PIXI.TextStyle> {
    return { fontFamily: FONT_FAMILY, fontSize, fill: TEXT_COLORS.white };
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

const LAYOUT_CSS = `
body.game-loading {
            background-color: #3d9ee8;
        }

        .loading-screen {
            position: fixed;
            inset: 0;
            z-index: 5000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: clamp(14px, 4vw, 24px);
            padding: 24px;
            background: linear-gradient(180deg, #3d9ee8 0%, #2a7ec4 100%);
            transition: opacity 0.4s ease, visibility 0.4s ease;
        }

        .loading-screen--hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        .loading-screen__title {
            font-family: ${FONT_FAMILY_CSS};
            font-size: clamp(14px, 4.5vw, 28px);
            color: #ffe066;
            text-align: center;
            text-shadow: 0 3px 0 #c92a2a, 0 0 24px rgba(255, 224, 102, 0.35);
            line-height: 1.5;
            max-width: 92vw;
        }

        .loading-screen__subtitle {
            font-family: ${FONT_FAMILY_CSS};
            font-size: clamp(6px, 2vw, 10px);
            color: #e8f4ff;
            text-align: center;
            letter-spacing: 1px;
            opacity: 0.9;
        }

        .loading-screen__bar-wrap {
            width: min(320px, 82vw);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }

        .loading-screen__bar-track {
            width: 100%;
            height: clamp(10px, 2.8vw, 14px);
            background: rgba(10, 25, 50, 0.55);
            border: 2px solid rgba(0, 0, 0, 0.45);
            border-radius: 4px;
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.35);
        }

        .loading-screen__bar-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #44aa44, #ffd43b, #ff922b);
            border-radius: 2px;
            transition: width 0.15s ease-out;
            box-shadow: 0 0 10px rgba(255, 212, 59, 0.45);
        }

        .loading-screen__meta {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            font-family: ${FONT_FAMILY_CSS};
            font-size: clamp(6px, 1.8vw, 9px);
            color: #d0ebff;
        }

        .loading-screen__status {
            flex: 1;
            text-align: left;
            line-height: 1.5;
        }

        .loading-screen__percent {
            flex-shrink: 0;
            color: #fff3bf;
        }

        html {
            width: 100%;
            height: 100%;
            height: 100dvh;
            overflow: hidden;
            touch-action: none;
            -webkit-text-size-adjust: 100%;
        }

        body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            height: 100dvh;
            overflow: hidden;
            overscroll-behavior: none;
            background-color: #000;
            position: fixed;
            inset: 0;
        }

        canvas {
            display: block;
            width: 100% !important;
            height: 100% !important;
            touch-action: none;
        }

        .hud-controls__btn {
            position: fixed;
            z-index: 2950;
            margin: 0;
            padding: 0;
            border: 2px solid #000;
            border-radius: 3px;
            font-family: ${FONT_FAMILY_CSS};
            font-size: clamp(5px, 1.6vw, 8px);
            color: #fff;
            line-height: 1;
            cursor: pointer;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
            box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.25);
        }

        .hud-controls__btn--pause {
            background: #0099cc;
        }

        .hud-controls__btn--sound {
            background: #777777;
        }

        .hud-controls__btn--settings {
            background: #5c5c8a;
        }

        .hud-controls__btn:active {
            transform: translateY(1px);
            filter: brightness(0.92);
        }

        .snes-button {
            --bg-color: #e6e6e6;
            --text-color: #4a4a4a;
            --shadow-color: #8c8c8c;
            --highlight-color: #ffffff;

            position: relative;
            display: inline-block;
            padding: clamp(10px, 2.5vw, 15px) clamp(16px, 5vw, 30px);
            max-width: 90vw;
            text-align: center;
            text-transform: uppercase;
            background-color: var(--bg-color);
            border: none;
            border-radius: 40px;
            box-shadow:
                inset 2px 2px 0px var(--highlight-color),
                inset -2px -2px 0px var(--shadow-color),
                2px 2px 5px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            outline: none;
            transition: transform 0.1s, box-shadow 0.1s;
            z-index: 1000;
        }

        .snes-button:active {
            transform: translateY(2px);
            box-shadow:
                inset 2px 2px 0px var(--shadow-color),
                inset -2px -2px 0px var(--highlight-color);
        }

        .snes-button.has-ember-color {
            --bg-color: #ff6b6b;
            --text-color: #ffffff;
            --shadow-color: #c92a2a;
            --highlight-color: #ff8787;
        }

        .snes-button.has-ocean-color {
            --bg-color: #339af0;
            --text-color: #ffffff;
            --shadow-color: #1864ab;
            --highlight-color: #4dabf7;
        }

        .snes-button.has-sun-color {
            --bg-color: #fcc419;
            --text-color: #3b2f00;
            --shadow-color: #e67700;
            --highlight-color: #ffe066;
        }

        #ui-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }

        #ui-layer>* {
            pointer-events: auto;
            margin: 10px;
        }

        .menu-start-btn {
            position: fixed;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1100;
            margin: 0 !important;
            box-shadow:
                inset 2px 2px 0px var(--highlight-color),
                inset -2px -2px 0px var(--shadow-color),
                0 8px 28px rgba(255, 80, 60, 0.35);
        }

        .menu-start-btn:active {
            transform: translateX(-50%) translateY(2px);
        }

        .menu-info-btn {
            position: fixed;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1100;
            margin: 0 !important;
            max-width: 92vw;
            box-shadow:
                inset 2px 2px 0px var(--highlight-color),
                inset -2px -2px 0px var(--shadow-color),
                0 6px 22px rgba(40, 120, 220, 0.35);
        }

        .menu-info-btn:active {
            transform: translateX(-50%) translateY(2px);
        }

        .menu-rating-btn {
            position: fixed;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1100;
            margin: 0 !important;
            max-width: 92vw;
            box-shadow:
                inset 2px 2px 0px var(--highlight-color),
                inset -2px -2px 0px var(--shadow-color),
                0 6px 22px rgba(230, 160, 20, 0.35);
        }

        .menu-rating-btn:active {
            transform: translateX(-50%) translateY(2px);
        }

        .rating-popup {
            position: fixed;
            inset: 0;
            z-index: 2550;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px;
            background: rgba(5, 20, 45, 0.78);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        }

        .rating-popup__panel {
            position: relative;
            width: min(480px, 96vw);
            max-height: min(88vh, 680px);
            display: flex;
            flex-direction: column;
            padding: clamp(14px, 3vw, 22px);
            border-radius: 16px;
            background: linear-gradient(165deg, #5a9fd4 0%, #3d7ab8 55%, #2f6aa8 100%);
            border: 2px solid rgba(255, 224, 102, 0.45);
            box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .rating-popup__close {
            position: absolute;
            top: -12px;
            right: -12px;
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.15);
            line-height: 1;
            cursor: pointer;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        }

        .rating-popup__header {
            text-align: center;
            margin-bottom: 12px;
        }

        .rating-popup__scroll {
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            padding-right: 4px;
        }

        .rating-popup__section-title {
            margin-bottom: 8px;
        }

        .rating-popup__section-title--tiers {
            margin-top: 16px;
        }

        .rating-popup__table-wrap {
            overflow-x: auto;
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.18);
            border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .rating-popup__table {
            width: 100%;
            border-collapse: collapse;
        }

        .rating-popup__table th {
            padding: 8px 6px;
            text-align: center;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            white-space: nowrap;
        }

        .rating-popup__table td {
            padding: 8px 6px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .rating-popup__row--best td {
            background: rgba(255, 212, 59, 0.12);
        }

        .rating-popup__empty-row td {
            padding: 20px 12px;
            line-height: 1.6;
        }

        .arsenal-info-popup {
            position: fixed;
            inset: 0;
            z-index: 2550;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px;
            background: rgba(5, 20, 45, 0.78);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        }

        .arsenal-info-popup__panel {
            position: relative;
            width: min(520px, 96vw);
            max-height: min(88vh, 640px);
            display: flex;
            flex-direction: column;
            padding: clamp(14px, 3vw, 22px);
            border-radius: 16px;
            background: linear-gradient(165deg, #5a9fd4 0%, #3d7ab8 55%, #2f6aa8 100%);
            border: 2px solid rgba(255, 224, 102, 0.45);
            box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .arsenal-info-popup__close {
            position: absolute;
            top: -12px;
            right: -12px;
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.15);
            line-height: 1;
            cursor: pointer;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        }

        .arsenal-info-popup__header {
            text-align: center;
            margin-bottom: 12px;
        }

        .arsenal-info-popup__scroll {
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            padding-right: 4px;
        }

        .arsenal-info-popup__grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
        }

        @media (min-width: 520px) {
            .arsenal-info-popup__grid {
                grid-template-columns: repeat(3, minmax(0, 1fr));
            }
        }

        .arsenal-info-popup__card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 10px 8px 12px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.18);
            border: 1.5px solid var(--accent, #88ccff);
            text-align: center;
        }

        .arsenal-info-popup__icon-wrap {
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .arsenal-info-popup__icon {
            max-width: 68px;
            max-height: 68px;
            image-rendering: pixelated;
        }

        .arsenal-info-popup__name {
            line-height: 1.4;
        }

        .arsenal-info-popup__desc {
            line-height: 1.55;
        }

        .record-banner {
            position: fixed;
            top: 0;
            left: 50%;
            transform: translate(-50%, -120px);
            z-index: 3000;
            text-align: center;
            pointer-events: none;
            padding: clamp(10px, 3vw, 18px) clamp(20px, 6vw, 40px);
            border-radius: 12px;
            background: linear-gradient(135deg, rgba(255, 212, 59, 0.95), rgba(255, 146, 43, 0.92));
            box-shadow: 0 8px 32px rgba(255, 180, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4);
            border: 2px solid rgba(255, 255, 255, 0.35);
        }

        .record-banner__text {
            display: block;
        }

        .record-banner__sub {
            display: block;
            margin-top: 8px;
        }

        .overheat-bar {
            position: fixed;
            bottom: max(12px, env(safe-area-inset-bottom, 12px));
            left: 50%;
            transform: translateX(-50%);
            z-index: 2900;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            pointer-events: none;
            width: min(280px, 72vw);
        }

        .overheat-bar__track {
            width: 100%;
            height: clamp(6px, 1.6vw, 10px);
            background: rgba(20, 20, 30, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 4px;
            overflow: hidden;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        .overheat-bar__fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #44aa44, #ccaa22, #ff4400);
            border-radius: 3px;
            transition: width 0.05s linear;
        }

        .overheat-bar__fill--max {
            background: linear-gradient(90deg, #ff2200, #ff6600, #ffaa00);
            animation: overheat-pulse 0.35s ease-in-out infinite alternate;
        }

        @keyframes overheat-pulse {
            from { filter: brightness(1); }
            to { filter: brightness(1.4); }
        }

        .booster-toast {
            position: fixed;
            top: clamp(54px, 10vh, 72px);
            left: 50%;
            z-index: 2800;
            pointer-events: none;
            padding: 5px 12px;
            border-radius: 6px;
            background: rgba(20, 55, 100, 0.88);
            border: 1px solid rgba(100, 180, 255, 0.4);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
            white-space: nowrap;
            max-width: 92vw;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .result-popup {
            position: fixed;
            inset: 0;
            z-index: 2500;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            background: rgba(5, 8, 20, 0.82);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        }

        .result-popup__panel {
            width: min(420px, 94vw);
            padding: clamp(20px, 5vw, 36px);
            border-radius: 16px;
            background: linear-gradient(160deg, #1a1f3a 0%, #0d1025 100%);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08);
            text-align: center;
        }

        .result-popup__header {
            margin-bottom: 12px;
        }

        .result-popup__record {
            display: inline-block;
            background: linear-gradient(90deg, #ffd43b, #ff922b);
            padding: 6px 14px;
            border-radius: 20px;
            margin-bottom: 16px;
        }

        .result-popup__rating {
            margin: 16px 0 24px;
        }

        .result-popup__tier {
            display: block;
            line-height: 1;
        }

        .result-popup__tier-title {
            display: block;
            margin-top: 10px;
            opacity: 0.85;
        }

        .result-popup__stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
        }

        .result-popup__stat {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 12px 8px;
            border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .result-popup__stat-label {
            display: block;
            margin-bottom: 6px;
        }

        .result-popup__stat-value {
            display: block;
        }

        .result-popup__actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
        }

        .result-popup__btn {
            position: relative !important;
            flex: 1 1 auto;
            min-width: 120px;
        }

        .intro-popup {
            position: fixed;
            inset: 0;
            z-index: 2700;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            background: rgba(5, 12, 32, 0.88);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }

        .intro-popup__panel {
            width: min(400px, 92vw);
            padding: clamp(22px, 5vw, 32px);
            border-radius: 16px;
            background: linear-gradient(165deg, #2a4a6e 0%, #1a3050 55%, #0f2040 100%);
            border: 2px solid rgba(255, 224, 102, 0.35);
            box-shadow: 0 24px 56px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            text-align: center;
        }

        .intro-popup__header {
            margin-bottom: 18px;
            letter-spacing: 2px;
        }

        .intro-popup__body {
            margin-bottom: 24px;
        }

        .intro-popup__line {
            margin: 0 0 14px;
            line-height: 1.75;
        }

        .intro-popup__line:last-child {
            margin-bottom: 0;
            color: #ffe066;
        }

        .intro-popup__btn {
            position: relative !important;
            min-width: 140px;
        }

        .settings-popup {
            position: fixed;
            inset: 0;
            z-index: 2600;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            background: rgba(5, 8, 20, 0.82);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        }

        .settings-popup__panel {
            position: relative;
            width: min(360px, 92vw);
            padding: clamp(18px, 4vw, 28px);
            border-radius: 14px;
            background: linear-gradient(160deg, #1a1f3a 0%, #0d1025 100%);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .settings-popup__close {
            position: absolute;
            top: -12px;
            right: -12px;
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.08);
            line-height: 1;
            cursor: pointer;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        }

        .settings-popup__close:hover {
            background: rgba(255, 255, 255, 0.14);
        }

        .settings-popup__header {
            text-align: center;
            margin-bottom: 20px;
        }

        .settings-popup__section-title {
            margin-bottom: 14px;
        }

        .settings-popup__row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 14px;
        }

        .settings-popup__row--volume {
            align-items: flex-start;
            flex-direction: column;
        }

        .settings-popup__mute {
            position: relative !important;
            min-width: 72px;
            padding: 8px 14px !important;
        }

        .settings-popup__slider-wrap {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
        }

        .settings-popup__slider {
            flex: 1;
            height: 8px;
            -webkit-appearance: none;
            appearance: none;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.12);
            outline: none;
        }

        .settings-popup__slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6ea8ff, #4dabf7);
            border: 2px solid #fff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
            cursor: pointer;
        }

        .settings-popup__slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6ea8ff, #4dabf7);
            border: 2px solid #fff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
            cursor: pointer;
        }

        .settings-popup__slider:disabled {
            opacity: 0.35;
        }

        .settings-popup__volume-value {
            min-width: 38px;
            text-align: right;
        }
`;

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

export const GAME_CSS = LAYOUT_CSS + TYPOGRAPHY_CSS;

export function installGameTypography(): void {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = GAME_CSS;
    document.head.appendChild(style);
}