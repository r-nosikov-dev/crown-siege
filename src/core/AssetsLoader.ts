import * as PIXI from 'pixi.js';

const MANIFEST_PATH = 'assets/config/textures.json';

export const ASSETS = {
    ORC: 'orc',
    ORC_DEATH: 'orc_death',
    BACKGROUND: 'background',
    BOOST: 'boost_collectible',
    CASTLE: 'castle',
    WEAPON_PISTOL: 'weapon_pistol',
    WEAPON_SHOTGUN: 'weapon_shotgun',
    WEAPON_AK: 'weapon_ak',
    WEAPON_MINIGUN: 'weapon_minigun',
    WEAPON_RPG: 'weapon_rpg',
    BLOOD_ATLAS: 'blood_atlas',
    BULLET_ATLAS: 'bullet_atlas',
} as const;

export type AssetAlias = (typeof ASSETS)[keyof typeof ASSETS];

interface SpriteSheetFrame {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface SpriteSheetMeta {
    frames: SpriteSheetFrame[];
}

interface TexturesManifest {
    textures: Record<string, string>;
    ui?: Record<string, string>;
    spriteSheets?: Record<string, string>;
}

export class AssetsLoader {
    private static instance: AssetsLoader;
    private loaded = false;
    private uiPaths: Record<string, string> = {};
    private bloodStainTextures: PIXI.Texture[] = [];
    private bulletMarkTextures: PIXI.Texture[] = [];

    private constructor() {}

    public static getInstance(): AssetsLoader {
        if (!AssetsLoader.instance) {
            AssetsLoader.instance = new AssetsLoader();
        }
        return AssetsLoader.instance;
    }

    public async loadGameAssets(): Promise<void> {
        if (this.loaded) return;

        const response = await fetch(MANIFEST_PATH);
        if (!response.ok) {
            throw new Error(`Failed to load textures manifest: ${MANIFEST_PATH}`);
        }

        const manifest = await response.json() as TexturesManifest;
        this.uiPaths = manifest.ui ?? {};

        const bundle = Object.entries(manifest.textures).map(([alias, src]) => ({
            alias,
            src,
        }));

        await PIXI.Assets.load(bundle);
        await this.loadSpriteSheets(manifest.spriteSheets);
        this.loaded = true;
    }

    private async loadSpriteSheets(spriteSheets?: Record<string, string>): Promise<void> {
        if (!spriteSheets) return;

        for (const [alias, metaPath] of Object.entries(spriteSheets)) {
            const metaResponse = await fetch(metaPath);
            if (!metaResponse.ok) {
                throw new Error(`Failed to load sprite sheet meta: ${metaPath}`);
            }

            const meta = await metaResponse.json() as SpriteSheetMeta;
            const sheet = PIXI.Assets.get<PIXI.Texture>(alias);
            if (!sheet) {
                throw new Error(`Sprite sheet texture not found: ${alias}`);
            }

            const frames = meta.frames.map(frame => new PIXI.Texture({
                source: sheet.source,
                frame: new PIXI.Rectangle(frame.x, frame.y, frame.width, frame.height),
            }));

            if (alias === ASSETS.BLOOD_ATLAS) {
                this.bloodStainTextures = frames;
            } else if (alias === ASSETS.BULLET_ATLAS) {
                this.bulletMarkTextures = frames;
            }
        }
    }

    public getTexture(alias: AssetAlias): PIXI.Texture {
        return PIXI.Assets.get(alias);
    }

    public getUiPath(key: string): string | undefined {
        return this.uiPaths[key];
    }

    public getRandomBloodStainTexture(): PIXI.Texture {
        if (this.bloodStainTextures.length === 0) {
            throw new Error('No blood stain frames loaded from sprite sheet');
        }
        return this.bloodStainTextures[Math.floor(Math.random() * this.bloodStainTextures.length)];
    }

    public getRandomBulletMarkTexture(): PIXI.Texture {
        if (this.bulletMarkTextures.length === 0) {
            throw new Error('No bullet mark frames loaded from sprite sheet');
        }
        return this.bulletMarkTextures[Math.floor(Math.random() * this.bulletMarkTextures.length)];
    }

    public getAimCursor(hotspotX = 16, hotspotY = 16): string {
        const path = this.uiPaths.aim;
        if (!path) {
            return 'crosshair';
        }
        return `url('${path}') ${hotspotX} ${hotspotY}, auto`;
    }

    public isLoaded(): boolean {
        return this.loaded;
    }
}