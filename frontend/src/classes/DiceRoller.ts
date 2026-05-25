/**
 * DiceRoller — DOM-based 3D Dice Roller
 *
 * Manages a CSS 3D dice element, tracks roll history, and updates
 * frequency bars in the DOM. Standalone (no p5.js dependency).
 *
 * Expected DOM structure (see index.html):
 *  #dice               — the clickable 3D cube element
 *  #rollCount          — text node showing total rolls
 *  #currentRoll        — text node showing last result
 *  #rollHistory        — container for roll number chips
 *  #bar1 … #bar6       — frequency bar elements
 *
 * @author Interactive Media Assignment — UTS 2025
 * @since v2.0.0
 */
export class DiceRoller {
  /** The clickable dice DOM element. */
  private readonly dice: HTMLElement;

  /** Number of rolls completed in this session. */
  private rollCount: number;

  /** Maximum rolls before showing the completion summary. */
  private readonly maxRolls: number;

  /** Ordered list of dice results (1-6) for this session. */
  private rollHistory: number[];

  /**
   * Frequency of each face value.
   * Index 0 → face 1, index 5 → face 6.
   */
  private readonly frequency: [number, number, number, number, number, number];

  /** True while the CSS roll animation is in progress. */
  private isRolling: boolean;

  /** CSS transform strings for each face (keys 1-6). */
  private readonly faceRotations: Readonly<Record<number, string>>;

  constructor() {
    const el = document.getElementById('dice');
    if (!el) throw new Error('DiceRoller: #dice element not found in DOM');

    this.dice         = el;
    this.rollCount    = 0;
    this.maxRolls     = 18;
    this.rollHistory  = [];
    this.frequency    = [0, 0, 0, 0, 0, 0];
    this.isRolling    = false;

    this.faceRotations = {
      1: 'rotateX(0deg) rotateY(0deg)',
      2: 'rotateX(-90deg) rotateY(0deg)',
      3: 'rotateX(0deg) rotateY(90deg)',
      4: 'rotateX(0deg) rotateY(-90deg)',
      5: 'rotateX(90deg) rotateY(0deg)',
      6: 'rotateX(0deg) rotateY(180deg)',
    } as const;

    this.dice.addEventListener('click', (): void => { this.rollDice(); });
  }

  /* ================================================================
     Rolling
     ================================================================ */

  /**
   * Initiates a dice roll with CSS animation.
   * No-ops if already rolling or the maximum roll count is reached.
   */
  rollDice(): void {
    if (this.isRolling || this.rollCount >= this.maxRolls) return;

    this.isRolling = true;
    this.dice.classList.add('rolling');

    const result = Math.floor(Math.random() * 6) + 1;

    setTimeout((): void => {
      this.dice.classList.remove('rolling');
      this.dice.style.transform = this.faceRotations[result] ?? '';

      this.recordRoll(result);
      this.updateDisplay();
      this.isRolling = false;
    }, 600);
  }

  /**
   * Records a roll result and increments the corresponding frequency bucket.
   *
   * @param result - Face value (1-6)
   */
  private recordRoll(result: number): void {
    this.rollCount++;
    this.rollHistory.push(result);
    this.frequency[result - 1]++;
  }

  /* ================================================================
     DOM update
     ================================================================ */

  /** Refreshes all DOM elements with the latest roll data. */
  private updateDisplay(): void {
    const rollCountEl  = document.getElementById('rollCount');
    const currentRollEl = document.getElementById('currentRoll');
    if (rollCountEl)   rollCountEl.textContent  = String(this.rollCount);
    if (currentRollEl) currentRollEl.textContent = String(this.rollHistory[this.rollHistory.length - 1]);

    // History chips
    const historyContainer = document.getElementById('rollHistory');
    if (historyContainer) {
      historyContainer.innerHTML = '';
      this.rollHistory.forEach((roll): void => {
        const chip       = document.createElement('div');
        chip.className   = 'roll-number';
        chip.textContent = String(roll);
        historyContainer.appendChild(chip);
      });
    }

    // Frequency bars
    const maxFreq = Math.max(...this.frequency, 1);
    for (let i = 1; i <= 6; i++) {
      const bar = document.getElementById(`bar${i}`) as HTMLElement | null;
      if (bar) {
        const heightPx = Math.max((this.frequency[i - 1] / maxFreq) * 100, 5);
        bar.style.height = `${heightPx}px`;
        bar.title        = `${i}: ${this.frequency[i - 1]} times`;
      }
    }

    // Completion summary
    if (this.rollCount >= this.maxRolls) {
      setTimeout((): void => {
        alert(`Test complete!\n${this.getStatsSummary()}`);
      }, 100);
    }
  }

  /* ================================================================
     Statistics
     ================================================================ */

  /**
   * Builds a human-readable summary of roll distribution and chi-square fairness test.
   *
   * @returns Multi-line summary string
   */
  getStatsSummary(): string {
    let summary = `${this.maxRolls} rolls completed:\n`;

    for (let i = 1; i <= 6; i++) {
      const count      = this.frequency[i - 1];
      const percentage = ((count / this.rollCount) * 100).toFixed(1);
      summary += `  ${i}: ${count} times (${percentage}%)\n`;
    }

    const expected  = this.rollCount / 6;
    const chiSquare = this.frequency.reduce(
      (acc, obs): number => acc + Math.pow(obs - expected, 2) / expected,
      0
    );

    summary += `\nFairness (chi-squared): ${chiSquare.toFixed(2)}`;
    summary += '\n(Lower values indicate more even distribution)';

    return summary;
  }
}

/* ================================================================
   Auto-initialise when the DOM is ready (standalone page usage)
   ================================================================ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', (): void => {
    if (document.getElementById('dice')) {
      new DiceRoller();
    }
  });
} else if (document.getElementById('dice')) {
  new DiceRoller();
}
