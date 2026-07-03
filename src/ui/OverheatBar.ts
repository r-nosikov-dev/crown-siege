let barEl: HTMLDivElement | null = null;
let fillEl: HTMLDivElement | null = null;
let labelEl: HTMLSpanElement | null = null;

function ensureBar(): void {
    if (barEl) return;

    barEl = document.createElement('div');
    barEl.className = 'overheat-bar';
    barEl.innerHTML = `
        <span class="overheat-bar__label">HEAT</span>
        <div class="overheat-bar__track">
            <div class="overheat-bar__fill"></div>
        </div>
    `;
    document.body.appendChild(barEl);
    fillEl = barEl.querySelector('.overheat-bar__fill') as HTMLDivElement;
    labelEl = barEl.querySelector('.overheat-bar__label') as HTMLSpanElement;
    barEl.style.display = 'none';
    barEl.style.top = '';
}

export function showOverheatBar(visible: boolean): void {
    ensureBar();
    if (barEl) barEl.style.display = visible ? 'flex' : 'none';
}

export function updateOverheatBar(heat: number, overheated: boolean): void {
    ensureBar();
    if (!fillEl || !labelEl || !barEl) return;

    const pct = Math.min(100, Math.max(0, heat * 100));
    fillEl.style.width = `${pct}%`;

    if (overheated) {
        fillEl.classList.add('overheat-bar__fill--max');
        labelEl.textContent = 'OVERHEAT';
        barEl.classList.add('overheat-bar--danger');
    } else if (heat > 0.65) {
        fillEl.classList.add('overheat-bar__fill--max');
        labelEl.textContent = 'HEAT';
        barEl.classList.add('overheat-bar--danger');
    } else {
        fillEl.classList.remove('overheat-bar__fill--max');
        labelEl.textContent = 'HEAT';
        barEl.classList.remove('overheat-bar--danger');
    }
}

export function hideOverheatBar(): void {
    showOverheatBar(false);
}