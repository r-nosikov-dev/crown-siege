const MANIFEST_PATH = 'assets/config/audio.json';

export type SoundName =
    | 'shot'
    | 'shootgun'
    | 'assault'
    | 'minigun'
    | 'rpg'
    | 'bonus'
    | 'death_orc';

interface AudioManifest {
    sounds: Record<string, string>;
}

export class AudioLoader {
    private static instance: AudioLoader;
    private loaded = false;
    private sounds: Record<string, string> = {};

    private constructor() {}

    public static getInstance(): AudioLoader {
        if (!AudioLoader.instance) {
            AudioLoader.instance = new AudioLoader();
        }
        return AudioLoader.instance;
    }

    public async loadAudioManifest(): Promise<void> {
        if (this.loaded) return;

        const response = await fetch(MANIFEST_PATH);
        if (!response.ok) {
            throw new Error(`Failed to load audio manifest: ${MANIFEST_PATH}`);
        }

        const manifest = await response.json() as AudioManifest;
        this.sounds = manifest.sounds ?? {};
        this.loaded = true;
    }

    public getSoundPath(name: SoundName): string {
        const path = this.sounds[name];
        if (!path) {
            throw new Error(`Sound not found in audio manifest: ${name}`);
        }
        return path;
    }

    public getSoundNames(): SoundName[] {
        return Object.keys(this.sounds) as SoundName[];
    }

    public isLoaded(): boolean {
        return this.loaded;
    }
}