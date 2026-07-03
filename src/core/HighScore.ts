import { getRating, RatingTier } from '../game/SurvivalConfig';

const LEADERBOARD_KEY = 'glacial-void-leaderboard';
const LEGACY_BEST_KEY = 'glacial-void-best-time';
const MAX_ENTRIES = 15;

export interface GameResult {
    id: string;
    elapsed: number;
    kills: number;
    score: number;
    tier: RatingTier;
    date: number;
}

export class HighScore {
    public static load(): number {
        const board = HighScore.getLeaderboard();
        return board.length > 0 ? board[0].elapsed : 0;
    }

    public static save(timeSeconds: number): void {
        if (timeSeconds <= 0) return;
        const current = HighScore.load();
        if (timeSeconds > current) {
            try {
                localStorage.setItem(LEGACY_BEST_KEY, timeSeconds.toString());
            } catch { /* storage unavailable */ }
        }
    }

    public static isNewRecord(timeSeconds: number): boolean {
        return timeSeconds > HighScore.load();
    }

    public static saveRun(elapsed: number, kills: number, score: number): GameResult {
        const rating = getRating(elapsed);
        const entry: GameResult = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            elapsed,
            kills,
            score,
            tier: rating.tier,
            date: Date.now(),
        };

        const board = HighScore.getLeaderboard();
        board.push(entry);
        board.sort((a, b) => b.elapsed - a.elapsed || b.score - a.score);
        HighScore.persist(board.slice(0, MAX_ENTRIES));
        HighScore.save(elapsed);
        return entry;
    }

    public static getLeaderboard(): GameResult[] {
        try {
            const raw = localStorage.getItem(LEADERBOARD_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as GameResult[];
                if (Array.isArray(parsed)) {
                    return parsed
                        .filter(r => typeof r.elapsed === 'number' && r.elapsed > 0)
                        .sort((a, b) => b.elapsed - a.elapsed || b.score - a.score);
                }
            }
        } catch { /* fall through to legacy migration */ }

        return HighScore.migrateLegacyBest();
    }

    private static migrateLegacyBest(): GameResult[] {
        try {
            const raw = localStorage.getItem(LEGACY_BEST_KEY);
            const elapsed = raw ? parseFloat(raw) : 0;
            if (elapsed > 0) {
                const entry: GameResult = {
                    id: 'legacy-best',
                    elapsed,
                    kills: 0,
                    score: 0,
                    tier: getRating(elapsed).tier,
                    date: Date.now(),
                };
                HighScore.persist([entry]);
                return [entry];
            }
        } catch { /* storage unavailable */ }
        return [];
    }

    private static persist(board: GameResult[]): void {
        try {
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board));
        } catch { /* storage unavailable */ }
    }
}