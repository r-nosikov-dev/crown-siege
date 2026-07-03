import { AssetsLoader, ASSETS } from '../core/AssetsLoader';
import { GameBooster } from './GameBooster';

export class ShotgunPickup extends GameBooster {
    constructor(x: number, y: number) {
        super(x, y, AssetsLoader.getInstance().getTexture(ASSETS.WEAPON_SHOTGUN));
    }
}