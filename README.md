# Crown Siege

A browser survival shooter built with PixiJS 8, TypeScript, and Webpack 5. Defend the castle, protect the princess, and survive endless goblin waves.

## Gameplay

You are **John**, sent from the future to change history. Goblins attack from all sides — shoot them before they reach the castle. The run ends when the castle falls.

- **Castle HP** — enemies that reach the castle deal damage; the castle heals +20 HP every 1000 score
- **Survival** — waves grow faster and larger over time; enemy speed ramps up
- **Weapons** — pistol by default; pickups grant shotgun, RPG, assault rifle, and minigun
- **Overheat** — assault rifle and minigun build heat; stop firing to cool down
- **Bonuses** — slow-time potions and weapon ammo drops spawn on the field
- **Rating** — rank your run (S–D) by survival time; best runs are saved locally

## Controls

| Input | Action |
| --- | --- |
| Tap / click | Aim and shoot |
| Hold | Continuous fire (auto weapons) |
| HUD buttons | Pause, sound, settings |

Works on desktop and mobile browsers.

## Requirements

- Node.js 16+
- npm

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:8080](http://localhost:8080).

Production build:

```bash
npm run build
```

Output goes to `dist/`.

## Project Structure

```
src/
├── assets/config/   # textures.json, audio.json
├── assets/images/   # sprites and sprite sheets (WebP)
├── assets/sounds/   # weapon and SFX audio
├── core/            # GameApp, scenes, assets/audio loaders, viewport
├── effects/         # blood, explosions, bullet marks, toasts
├── entities/        # Castle, enemies, weapon pickups
├── game/            # GameController, survival balance, managers
├── scenes/          # Menu and game scenes
├── styles/          # Shared typography (PIXI + DOM)
└── ui/              # HUD, popups, overheat bar
```

Asset manifests in `textures.json` and `audio.json` drive loading; no hard-coded asset paths in game logic.