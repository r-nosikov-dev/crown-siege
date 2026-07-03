const HIDE_MS = 400;

const PHASES = [
    { size: 15, label: 'Loading fonts...' },
    { size: 10, label: 'Starting engine...' },
    { size: 55, label: 'Loading graphics...' },
    { size: 10, label: 'Loading audio...' },
    { size: 10, label: 'Almost ready...' },
] as const;

export class LoadingScreen {
    private static root: HTMLElement | null = null;
    private static fill: HTMLElement | null = null;
    private static status: HTMLElement | null = null;
    private static percent: HTMLElement | null = null;
    private static bound = false;

    static bind(): void {
        if (this.bound) return;
        this.root = document.getElementById('loading-screen');
        this.fill = document.getElementById('loading-bar-fill');
        this.status = document.getElementById('loading-status');
        this.percent = document.getElementById('loading-percent');
        this.bound = true;
    }

    static setProgress(value: number, label?: string): void {
        this.bind();
        const pct = Math.round(Math.max(0, Math.min(100, value)));
        if (this.fill) this.fill.style.width = `${pct}%`;
        if (this.percent) this.percent.textContent = `${pct}%`;
        if (label && this.status) this.status.textContent = label;
    }

    static setPhase(phaseIndex: number, subProgress = 1, label?: string): void {
        const phase = PHASES[phaseIndex];
        if (!phase) return;

        const base = PHASES.slice(0, phaseIndex).reduce((sum, item) => sum + item.size, 0);
        const value = base + phase.size * Math.max(0, Math.min(1, subProgress));
        this.setProgress(value, label ?? phase.label);
    }

    static async hide(): Promise<void> {
        this.bind();
        this.setProgress(100, 'Ready!');

        if (!this.root) return;

        this.root.classList.add('loading-screen--hidden');
        await new Promise(resolve => setTimeout(resolve, HIDE_MS));
        this.root.remove();
        this.root = null;
        this.fill = null;
        this.status = null;
        this.percent = null;
        this.bound = false;
    }
}