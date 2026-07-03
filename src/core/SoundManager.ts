import { AudioLoader, SoundName } from './AudioLoader';

const STORAGE_KEY = 'glacial_void_sound';

interface SoundPrefs {
    muted: boolean;
    volume: number;
}

export class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private initialized = false;
    private muted = false;
    private volume = 1;

    private constructor() {}

    public init(): void {
        if (this.initialized) return;

        const audioLoader = AudioLoader.getInstance();
        for (const name of audioLoader.getSoundNames()) {
            const path = audioLoader.getSoundPath(name);
            this.sounds.set(name, new Audio(path));
        }

        this.loadPrefs();
        this.initialized = true;
    }

    private loadPrefs(): void {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const prefs = JSON.parse(raw) as SoundPrefs;
            this.muted = Boolean(prefs.muted);
            this.volume = Math.max(0, Math.min(1, Number(prefs.volume) || 1));
        } catch { /* storage unavailable */ }
        this.applyVolume();
    }

    private savePrefs(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                muted: this.muted,
                volume: this.volume,
            } satisfies SoundPrefs));
        } catch { /* storage unavailable */ }
    }

    private applyVolume(): void {
        const level = this.muted ? 0 : this.volume;
        this.sounds.forEach(sound => {
            sound.volume = level;
        });
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    public play(name: SoundName): void {
        if (!this.initialized || this.muted) return;
        const sound = this.sounds.get(name);
        if (sound) {
            sound.volume = this.volume;
            sound.currentTime = 0;
            sound.play().catch(e => console.warn('Audio play failed', e));
        }
    }

    public toggleMute(): boolean {
        this.setMuted(!this.muted);
        return this.muted;
    }

    public setMuted(muted: boolean): void {
        this.muted = muted;
        this.applyVolume();
        this.savePrefs();
    }

    public setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        this.applyVolume();
        this.savePrefs();
    }

    public getVolume(): number {
        return this.volume;
    }

    public isMuted(): boolean {
        return this.muted;
    }
}