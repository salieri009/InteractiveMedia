class OrderChaosComposition {
            constructor() {
                this.canvas = document.getElementById('canvas');
                this.ctx = this.canvas.getContext('2d');
                this.entropy = 0.5; // 0 = order, 1 = chaos
                this.targetEntropy = 0.5;
                this.particles = [];
                this.numParticles = 120;
                this.mouseX = 0;
                this.mouseY = 0;
                
                this.setupCanvas();
                this.createParticles();
                this.setupEventListeners();
                this.animate();
            }
            
            setupCanvas() {
                this.resizeCanvas();
                window.addEventListener('resize', () => this.resizeCanvas());
            }
            
            resizeCanvas() {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.centerX = this.canvas.width / 2;
                this.centerY = this.canvas.height / 2;
            }
            
            createParticles() {
                this.particles = [];
                const gridSize = Math.sqrt(this.numParticles);
                const spacing = Math.min(this.canvas.width, this.canvas.height) / (gridSize + 1);
                
                for (let i = 0; i < this.numParticles; i++) {
                    const gridX = i % gridSize;
                    const gridY = Math.floor(i / gridSize);
                    
                    const particle = {
                        id: i,
                        // Order position (grid)
                        orderX: this.centerX + (gridX - gridSize/2) * spacing * 0.8,
                        orderY: this.centerY + (gridY - gridSize/2) * spacing * 0.8,
                        // Chaos position (random)
                        chaosX: Math.random() * this.canvas.width,
                        chaosY: Math.random() * this.canvas.height,
                        // Current position
                        x: 0,
                        y: 0,
                        // Velocity for chaos
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        // Visual properties
                        size: 3 + Math.random() * 4,
                        baseSize: 3 + Math.random() * 4,
                        color: {
                            h: (i / this.numParticles) * 360 + Math.random() * 60,
                            s: 60 + Math.random() * 40,
                            l: 50 + Math.random() * 30
                        },
                        // Animation properties
                        phase: Math.random() * Math.PI * 2,
                        speed: 0.02 + Math.random() * 0.03
                    };
                    
                    // Initialize position
                    particle.x = this.lerp(particle.orderX, particle.chaosX, this.entropy);
                    particle.y = this.lerp(particle.orderY, particle.chaosY, this.entropy);
                    
                    this.particles.push(particle);
                }
            }
            
            setupEventListeners() {
                this.canvas.addEventListener('mousemove', (e) => {
                    this.mouseX = e.clientX;
                    this.mouseY = e.clientY;
                    
                    // Map mouse X position to entropy (0 to 1)
                    this.targetEntropy = this.map(this.mouseX, 0, this.canvas.width, 0, 1);
                    this.targetEntropy = this.constrain(this.targetEntropy, 0, 1);
                    
                    this.updateEntropyDisplay();
                });
            }
            
            updateEntropyDisplay() {
                const entropyPercent = Math.round(this.targetEntropy * 100);
                document.getElementById('entropyValue').textContent = entropyPercent + '%';
                
                const dot = document.getElementById('entropyDot');
                dot.style.left = (this.targetEntropy * 288) + 'px'; // 300px - 12px dot width
            }
            
            map(value, start1, stop1, start2, stop2) {
                return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
            }
            
            constrain(value, min, max) {
                return Math.max(min, Math.min(max, value));
            }
            
            lerp(start, end, t) {
                return start + (end - start) * t;
            }
            
            updateParticles() {
                // Smooth entropy transition
                this.entropy = this.lerp(this.entropy, this.targetEntropy, 0.05);
                
                this.particles.forEach((particle, i) => {
                    // Update chaos position with wandering motion
                    particle.chaosX += particle.vx + Math.sin(particle.phase) * 0.5;
                    particle.chaosY += particle.vy + Math.cos(particle.phase) * 0.5;
                    particle.phase += particle.speed;
                    
                    // Add some randomness to chaos movement
                    if (Math.random() < 0.02) {
                        particle.vx += (Math.random() - 0.5) * 0.5;
                        particle.vy += (Math.random() - 0.5) * 0.5;
                    }
                    
                    // Constrain chaos movement to canvas with wrapping
                    if (particle.chaosX < 0) particle.chaosX = this.canvas.width;
                    if (particle.chaosX > this.canvas.width) particle.chaosX = 0;
                    if (particle.chaosY < 0) particle.chaosY = this.canvas.height;
                    if (particle.chaosY > this.canvas.height) particle.chaosY = 0;
                    
                    // Damping for chaos velocity
                    particle.vx *= 0.99;
                    particle.vy *= 0.99;
                    
                    // Interpolate position based on entropy
                    particle.x = this.lerp(particle.orderX, particle.chaosX, this.entropy);
                    particle.y = this.lerp(particle.orderY, particle.chaosY, this.entropy);
                    
                    // Size variation based on entropy
                    const sizeVariation = this.entropy * 3;
                    particle.size = particle.baseSize + Math.sin(particle.phase * 2) * sizeVariation;
                    
                    // Color saturation based on entropy
                    particle.color.s = this.lerp(80, 100, this.entropy);
                    particle.color.l = this.lerp(60, 40 + Math.sin(particle.phase) * 20, this.entropy);
                });
            }
            
            drawConnections() {
                // Draw connections between nearby particles (more visible in order)
                const connectionRadius = this.lerp(150, 50, this.entropy);
                const maxConnections = Math.floor(this.lerp(3, 1, this.entropy));
                const alpha = this.lerp(0.3, 0.05, this.entropy);
                
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.lineWidth = 1;
                
                for (let i = 0; i < this.particles.length; i++) {
                    const p1 = this.particles[i];
                    let connections = 0;
                    
                    for (let j = i + 1; j < this.particles.length && connections < maxConnections; j++) {
                        const p2 = this.particles[j];
                        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                        
                        if (dist < connectionRadius) {
                            this.ctx.beginPath();
                            this.ctx.moveTo(p1.x, p1.y);
                            this.ctx.lineTo(p2.x, p2.y);
                            this.ctx.stroke();
                            connections++;
                        }
                    }
                }
            }
            
            drawParticles() {
                this.particles.forEach(particle => {
                    const { h, s, l } = particle.color;
                    const alpha = this.lerp(0.8, 0.6, this.entropy);
                    
                    // Particle glow effect
                    const glowSize = particle.size * (1 + this.entropy * 2);
                    const gradient = this.ctx.createRadialGradient(
                        particle.x, particle.y, 0,
                        particle.x, particle.y, glowSize
                    );
                    
                    gradient.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${alpha})`);
                    gradient.addColorStop(0.7, `hsla(${h}, ${s}%, ${l}%, ${alpha * 0.3})`);
                    gradient.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Core particle
                    this.ctx.fillStyle = `hsl(${h}, ${s}%, ${l + 20}%)`;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }
            
            drawBackground() {
                // Dynamic background based on entropy
                const gradient = this.ctx.createRadialGradient(
                    this.canvas.width/2, this.canvas.height/2, 0,
                    this.canvas.width/2, this.canvas.height/2, Math.max(this.canvas.width, this.canvas.height)/2
                );
                
                const orderColor = `rgba(5, 15, 35, 1)`;
                const chaosColor = `rgba(25, 5, 5, 1)`;
                
                gradient.addColorStop(0, this.lerpColor(orderColor, chaosColor, this.entropy));
                gradient.addColorStop(1, this.lerpColor('rgba(0, 5, 15, 1)', 'rgba(15, 0, 0, 1)', this.entropy));
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
            
            lerpColor(color1, color2, t) {
                // Simple color interpolation - in practice you'd want more sophisticated color space interpolation
                return color1; // Simplified for this demo
            }
            
            animate() {
                this.drawBackground();
                this.updateParticles();
                this.drawConnections();
                this.drawParticles();
                
                requestAnimationFrame(() => this.animate());
            }
        }
        
        // Initialize the composition
        const composition = new OrderChaosComposition();