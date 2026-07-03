export interface ViewportSize {
    width: number;
    height: number;
}

export function getViewportSize(): ViewportSize {
    const vv = window.visualViewport;
    if (vv) {
        return {
            width: Math.round(vv.width),
            height: Math.round(vv.height),
        };
    }

    return {
        width: Math.round(window.innerWidth),
        height: Math.round(window.innerHeight),
    };
}

/** True on narrow phones; tablets and desktop use full spawn sides. */
export function isPhoneViewport(): boolean {
    const { width, height } = getViewportSize();
    return Math.min(width, height) < 600;
}

const PHONE_SPEED_FACTOR = 0.68;

/** Slows enemies on short phone screens so reach time stays fair. */
export function getPlayfieldSpeedScale(playHeight: number): number {
    const REF_PLAY_HEIGHT = 700;
    let scale = Math.min(1, playHeight / REF_PLAY_HEIGHT);
    if (isPhoneViewport()) {
        scale *= PHONE_SPEED_FACTOR;
    }
    return scale;
}

/** Visual scale for castle and enemies; 1 on tablets and desktop. */
export function getPlayfieldEntityScale(): number {
    const { width, height } = getViewportSize();
    const minSide = Math.min(width, height);

    if (minSide >= 600) return 1;
    if (minSide < 340) return 0.5;
    if (minSide < 375) return 0.56;
    if (minSide < 414) return 0.64;
    if (minSide < 480) return 0.72;
    return 0.82;
}

export function getDevicePixelRatio(): number {
    return Math.min(window.devicePixelRatio || 1, 2.5);
}

export function setupViewportListeners(onResize: () => void): () => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const handler = (): void => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            onResize();
        }, 50);
    };

    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    window.visualViewport?.addEventListener('resize', handler);
    window.visualViewport?.addEventListener('scroll', handler);

    return () => {
        if (timeout) clearTimeout(timeout);
        window.removeEventListener('resize', handler);
        window.removeEventListener('orientationchange', handler);
        window.visualViewport?.removeEventListener('resize', handler);
        window.visualViewport?.removeEventListener('scroll', handler);
    };
}