export class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement>;
    private muted: boolean = false;

    private constructor() {
        this.sounds = new Map();
        // Preload simple beep sounds using data URIs for this demo
        this.sounds.set('hit', new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...')); // Placeholder
        this.sounds.set('win', new Audio(''));
        this.sounds.set('loss', new Audio(''));
        this.sounds.set('bgm', new Audio(''));
        this.sounds.set('shot', new Audio('assets/sounds/shot.mp3'));
        this.sounds.set('death_orc', new Audio('assets/sounds/death_orc.mp3'));
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    public play(name: string): void {
        if (this.muted) return;
        const sound = this.sounds.get(name);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.warn('Audio play failed', e));
        }
    }

    public toggleMute(): boolean {
        this.muted = !this.muted;
        return this.muted;
    }

    public isMuted(): boolean {
        return this.muted;
    }
}
