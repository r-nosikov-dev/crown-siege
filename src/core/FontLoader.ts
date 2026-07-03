import { FONT_FAMILY, FONT_FAMILY_CSS } from '../styles/GameTypography';

const FONT_SIZES = [8, 10, 12, 14, 16, 20, 24, 32, 36];
const LOAD_TIMEOUT_MS = 10_000;

let fontsReady: Promise<void> | null = null;

function waitForStylesheet(): Promise<void> {
    const link = document.querySelector<HTMLLinkElement>(
        'link[href*="Press+Start+2P"], link[href*="Press Start 2P"]',
    );
    if (!link) return Promise.resolve();

    if (link.sheet) return Promise.resolve();

    return new Promise((resolve) => {
        link.addEventListener('load', () => resolve(), { once: true });
        link.addEventListener('error', () => resolve(), { once: true });
    });
}

export function loadGameFonts(): Promise<void> {
    if (!fontsReady) {
        fontsReady = loadGameFontsInternal();
    }
    return fontsReady;
}

async function loadGameFontsInternal(): Promise<void> {
    await waitForStylesheet();

    if (!document.fonts?.load) return;

    const loads = FONT_SIZES.map(
        size => document.fonts.load(`${size}px ${FONT_FAMILY_CSS}`),
    );

    const loadAll = Promise.all(loads).then(() => document.fonts.ready);
    const timeout = new Promise<void>(resolve => setTimeout(resolve, LOAD_TIMEOUT_MS));

    await Promise.race([loadAll, timeout]);
}

export function invalidatePixiText(...texts: { text: string }[]): void {
    texts.forEach((node) => {
        const value = node.text;
        node.text = '';
        node.text = value;
    });
}