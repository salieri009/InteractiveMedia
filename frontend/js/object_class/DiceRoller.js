class DiceRoller {
            constructor() {
                this.dice = document.getElementById('dice');
                this.rollCount = 0;
                this.maxRolls = 18;
                this.rollHistory = [];
                this.frequency = [0, 0, 0, 0, 0, 0]; // Index 0-5 for faces 1-6
                this.isRolling = false;
                
                this.dice.addEventListener('click', () => this.rollDice());
                
                // Face rotations for each number
                this.faceRotations = {
                    1: 'rotateX(0deg) rotateY(0deg)',      // front
                    2: 'rotateX(-90deg) rotateY(0deg)',    // top
                    3: 'rotateX(0deg) rotateY(90deg)',     // right
                    4: 'rotateX(0deg) rotateY(-90deg)',    // left
                    5: 'rotateX(90deg) rotateY(0deg)',     // bottom
                    6: 'rotateX(0deg) rotateY(180deg)'     // back
                };
            }
            
            rollDice() {
                if (this.isRolling || this.rollCount >= this.maxRolls) return;
                
                this.isRolling = true;
                this.dice.classList.add('rolling');
                
                // Generate truly random number (1-6)
                const result = Math.floor(Math.random() * 6) + 1;
                
                setTimeout(() => {
                    this.dice.classList.remove('rolling');
                    this.dice.style.transform = this.faceRotations[result];
                    
                    this.recordRoll(result);
                    this.updateDisplay();
                    this.isRolling = false;
                }, 600);
            }
            
            recordRoll(result) {
                this.rollCount++;
                this.rollHistory.push(result);
                this.frequency[result - 1]++; // Convert 1-6 to 0-5 index
            }
            
            updateDisplay() {
                // Update roll count and current roll
                document.getElementById('rollCount').textContent = this.rollCount;
                document.getElementById('currentRoll').textContent = this.rollHistory[this.rollHistory.length - 1];
                
                // Update roll history display
                const historyContainer = document.getElementById('rollHistory');
                historyContainer.innerHTML = '';
                this.rollHistory.forEach(roll => {
                    const rollElement = document.createElement('div');
                    rollElement.className = 'roll-number';
                    rollElement.textContent = roll;
                    historyContainer.appendChild(rollElement);
                });
                
                // Update frequency bars
                const maxFreq = Math.max(...this.frequency, 1);
                for (let i = 1; i <= 6; i++) {
                    const bar = document.getElementById(`bar${i}`);
                    const height = (this.frequency[i - 1] / maxFreq) * 100;
                    bar.style.height = `${Math.max(height, 5)}px`;
                    bar.title = `${i}: ${this.frequency[i - 1]} times`;
                }
                
                // Show completion message
                if (this.rollCount >= this.maxRolls) {
                    setTimeout(() => {
                        alert(`Test complete! Results:\n${this.getStatsSummary()}`);
                    }, 100);
                }
            }
            
            getStatsSummary() {
                let summary = `18 rolls completed:\n`;
                for (let i = 1; i <= 6; i++) {
                    const count = this.frequency[i - 1];
                    const percentage = ((count / this.rollCount) * 100).toFixed(1);
                    summary += `${i}: ${count} times (${percentage}%)\n`;
                }
                
                // Calculate chi-square test for fairness
                const expected = this.rollCount / 6;
                let chiSquare = 0;
                for (let i = 0; i < 6; i++) {
                    chiSquare += Math.pow(this.frequency[i] - expected, 2) / expected;
                }
                summary += `\nFairness test (χ²): ${chiSquare.toFixed(2)}`;
                summary += `\n(Lower values indicate more even distribution)`;
                
                return summary;
            }
        }
        
        // Initialize the dice roller
        const diceRoller = new DiceRoller();