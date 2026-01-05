# Glacial Void - PixiJS Mini-Game

A mini-game built with PixiJS 8, TypeScript, and Webpack 5.

## Gameplay Features

**Goal:** Destroy all enemies before time runs out!

*   **Enemies:** Animated Orcs roam the battlefield. Click on them to destroy them.
*   **Booster:** Look for the magical potion! Collecting it grants you **+10 seconds** of extra time. There is one booster per level.
*   **Levels & Progression:**
    *   Complete levels to unlock the next challenge.
    *   **Star Rating:** Earn 1 to 3 stars based on your speed.
        *   ⭐⭐⭐: Excellent speed!
        *   ⭐⭐: Good job.
        *   ⭐: Completed just in time.
*   **Controls:**
    *   **Mouse Click:** Attack enemies, collect boosters, interact with UI.
    *   **UI:** Pause game, toggle sound, retry levels.

## Requirements

- Node.js (v16+)
- npm

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run in development mode:**
    This will start a local server with hot reloading.
    ```bash
    npm start
    ```
    After running this, open [http://localhost:8080](http://localhost:8080) in your browser.

3.  **Build for production:**
    This generates a optimized bundle in the `dist` folder.
    ```bash
    npm run build
    ```

## Project Structure

- `src/assets/`: Images, sounds, and level configurations.
- `src/core/`: Core engine logic (GameApp, SceneManager, SoundManager).
- `src/entities/`: Game objects (Enemy, GameBooster).
- `src/game/`: Higher-level game logic and managers.
- `src/scenes/`: Game states (Menu, Game).
- `src/ui/`: Heads-up display and popups.
- `src/index.ts`: Entry point.
