class ComparisonVisualizer {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        
        // Current architecture being compared
        this.currentArch = 'gqa';
        
        // State
        this.tokens = [];
        this.currentTokenIndex = 0;
        this.animationFrame = 0;
        this.isAnimating = false;
        this.attentionWeights = null;
        
        // Architecture specifications
        this.architectures = {
            mha: {
                name: 'Multi-Head Attention',
                numHeads: 32,
                kvHeads: 32,
                memoryMultiplier: 1.0,
                color: '#FF4500',
                description: 'Full attention with separate K,V for each head'
            },
            mqa: {
                name: 'Multi-Query Attention',
                numHeads: 32,
                kvHeads: 1,
                memoryMultiplier: 0.3,
                color: '#FF6B6B',
                description: 'Single K,V shared across all query heads'
            },
            gqa: {
                name: 'Grouped Query Attention',
                numHeads: 32,
                kvHeads: 8,
                memoryMultiplier: 0.5,
                color: '#FF8E53',
                description: 'Grouped K,V heads for balanced efficiency'
            }
        };
        
        // Colors
        this.colors = {
            query: '#4ECDC4',
            key: '#FF6B6B',
            value: '#FFE66D',
            attention: '#00FF7F',
            background: '#1a1a1a',
            text: '#FFFFFF',
            border: '#FFFFFF',
            inactive: '#74B9FF'
        };
    }
    
    setArchitecture(arch) {
        this.currentArch = arch;
        if (this.tokens.length > 0) {
            this.generateAttentionPattern();
            this.render();
        }
    }
    
    processTokens(tokens) {
        this.tokens = tokens;
        this.resetAnimation();
        this.generateAttentionPattern();
        this.startAnimation();
    }
    
    resetAnimation() {
        this.animationFrame = 0;
        this.currentTokenIndex = 0;
        this.isAnimating = false;
    }
    
    startAnimation() {
        if (this.tokens.length === 0) return;
        
        this.isAnimating = true;
        this.animate();
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        // Calculate frames based on token count for exactly one complete cycle
        const framesPerToken = 10;
        const maxFrames = this.tokens.length * framesPerToken + 20; // +20 for completion buffer
        
        if (this.animationFrame > maxFrames) {
            this.isAnimating = false;
            return;
        }
        
        // Update current token - ensure exact one cycle
        if (this.tokens.length > 0) {
            const tokenCycle = Math.floor(this.animationFrame / framesPerToken);
            this.currentTokenIndex = Math.min(tokenCycle, this.tokens.length - 1);
        }
        
        this.render();
        this.animationFrame++;
        
        if (this.isAnimating) {
            requestAnimationFrame(() => this.animate());
        }
    }
    
    generateAttentionPattern() {
        const arch = this.architectures[this.currentArch];
        this.attentionWeights = [];
        
        for (let i = 0; i < this.tokens.length; i++) {
            const weights = [];
            for (let j = 0; j < this.tokens.length; j++) {
                const distance = Math.abs(i - j);
                let baseWeight = Math.exp(-distance * 0.3);
                
                // Modify attention pattern based on architecture
                if (arch.kvHeads === 1) {
                    // MQA: More uniform attention (shared KV)
                    baseWeight = baseWeight * 0.7 + 0.3;
                } else if (arch.kvHeads === arch.numHeads) {
                    // MHA: Sharp, focused attention
                    baseWeight = Math.exp(-distance * 0.5);
                } else {
                    // GQA: Balanced attention pattern
                    baseWeight = Math.exp(-distance * 0.4);
                }
                
                const noise = (Math.random() - 0.5) * 0.1;
                weights.push(Math.max(0.05, baseWeight + noise));
            }
            const sum = weights.reduce((a, b) => a + b, 0);
            this.attentionWeights.push(weights.map(w => w / sum));
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawTitle();
        this.drawArchitectureDiagram();
        this.drawTokenFlow();
        this.drawAttentionPattern();
        this.drawMemoryVisualization();
        this.drawArchitectureSpecs();
    }
    
    drawTitle() {
        const arch = this.architectures[this.currentArch];
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(arch.name, this.canvas.width / 2, 25);
    }
    
    drawArchitectureDiagram() {
        const arch = this.architectures[this.currentArch];
        const startX = 30;
        const startY = 50;
        const headWidth = 15;
        const headHeight = 40;
        const spacing = 3;
        
        // Draw query heads
        this.ctx.fillStyle = this.colors.query;
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        
        for (let i = 0; i < Math.min(16, arch.numHeads); i++) {
            const x = startX + i * (headWidth + spacing);
            const y = startY;
            
            this.ctx.fillRect(x, y, headWidth, headHeight);
            this.ctx.strokeStyle = this.colors.border;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, headWidth, headHeight);
            
            if (i < 8) {
                this.ctx.fillStyle = '#000';
                this.ctx.fillText(`Q${i+1}`, x + headWidth/2, y + headHeight/2 + 3);
                this.ctx.fillStyle = this.colors.query;
            }
        }
        
        // Draw key-value heads - moved down to avoid overlap
        const kvStartY = startY + 80;
        const kvWidth = Math.max(headWidth, (16 * (headWidth + spacing)) / arch.kvHeads - spacing);
        
        this.ctx.fillStyle = this.colors.key;
        for (let i = 0; i < Math.min(16, arch.kvHeads); i++) {
            const x = startX + i * (kvWidth + spacing * 2);
            
            // Key head
            this.ctx.fillRect(x, kvStartY, kvWidth, headHeight * 0.7);
            this.ctx.strokeStyle = this.colors.border;
            this.ctx.strokeRect(x, kvStartY, kvWidth, headHeight * 0.7);
            
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(`K${i+1}`, x + kvWidth/2, kvStartY + headHeight * 0.35);
            
            // Value head
            this.ctx.fillStyle = this.colors.value;
            this.ctx.fillRect(x, kvStartY + headHeight * 0.8, kvWidth, headHeight * 0.7);
            this.ctx.strokeStyle = this.colors.border;
            this.ctx.strokeRect(x, kvStartY + headHeight * 0.8, kvWidth, headHeight * 0.7);
            
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(`V${i+1}`, x + kvWidth/2, kvStartY + headHeight * 1.15);
            this.ctx.fillStyle = this.colors.value;
        }
        
        // Draw connections from Q to KV
        this.drawQKVConnections(startX, startY, headWidth, spacing, kvStartY, kvWidth, arch);
        
        // Architecture label - moved down to avoid overlap
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${arch.numHeads} Query Heads → ${arch.kvHeads} KV Head${arch.kvHeads > 1 ? 's' : ''}`, startX, kvStartY + 100);
    }
    
    drawQKVConnections(qStartX, qStartY, headWidth, spacing, kvStartY, kvWidth, arch) {
        if (!this.isAnimating) return;
        
        const qHeadsToShow = Math.min(16, arch.numHeads);
        const kvHeadsToShow = Math.min(16, arch.kvHeads);
        
        // Animate connections
        const connectionAlpha = Math.sin(this.animationFrame * 0.1) * 0.3 + 0.5;
        
        for (let qIdx = 0; qIdx < qHeadsToShow; qIdx++) {
            // Determine which KV head this query head connects to
            let kvIdx;
            if (arch.kvHeads === 1) {
                kvIdx = 0; // MQA: all queries share one KV
            } else if (arch.kvHeads === arch.numHeads) {
                kvIdx = qIdx; // MHA: one-to-one mapping
            } else {
                // GQA: group queries to KV heads
                kvIdx = Math.floor(qIdx * arch.kvHeads / arch.numHeads);
            }
            
            if (kvIdx < kvHeadsToShow) {
                const qX = qStartX + qIdx * (headWidth + spacing) + headWidth/2;
                const qY = qStartY + headWidth;
                const kvX = qStartX + kvIdx * (kvWidth + spacing * 2) + kvWidth/2;
                const kvY = kvStartY;
                
                this.ctx.globalAlpha = connectionAlpha;
                this.ctx.strokeStyle = arch.color;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(qX, qY);
                this.ctx.lineTo(kvX, kvY);
                this.ctx.stroke();
                this.ctx.globalAlpha = 1.0;
            }
        }
    }
    
    drawTokenFlow() {
        if (this.tokens.length === 0) return;
        
        const startX = 50;
        const startY = 200;
        const tokenWidth = 50;
        const tokenHeight = 25;
        const spacing = 5;
        
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        
        this.tokens.forEach((token, i) => {
            const x = startX + i * (tokenWidth + spacing);
            
            let fillColor, borderColor, textColor;
            
            if (i === this.currentTokenIndex && this.isAnimating) {
                fillColor = 'rgba(255, 215, 0, 0.6)';
                borderColor = this.colors.attention;
                textColor = this.colors.attention;
            } else {
                const arch = this.architectures[this.currentArch];
                fillColor = `rgba(${this.hexToRgb(arch.color).r}, ${this.hexToRgb(arch.color).g}, ${this.hexToRgb(arch.color).b}, 0.3)`;
                borderColor = arch.color;
                textColor = arch.color;
            }
            
            this.ctx.fillStyle = fillColor;
            this.ctx.fillRect(x, startY, tokenWidth, tokenHeight);
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, startY, tokenWidth, tokenHeight);
            
            this.ctx.fillStyle = textColor;
            this.ctx.fillText(token.text.substring(0, 6), x + tokenWidth/2, startY + tokenHeight/2 + 3);
        });
    }
    
    drawAttentionPattern() {
        if (!this.attentionWeights || this.tokens.length === 0) return;
        
        const startX = 700;
        const startY = 50;
        const cellSize = 12;
        const maxTokens = Math.min(this.tokens.length, 15);
        
        // Draw attention matrix
        this.ctx.font = '8px Arial';
        this.ctx.textAlign = 'center';
        
        for (let i = 0; i < maxTokens; i++) {
            for (let j = 0; j < maxTokens; j++) {
                const x = startX + j * cellSize;
                const y = startY + i * cellSize;
                
                if (this.attentionWeights[i] && this.attentionWeights[i][j]) {
                    const weight = this.attentionWeights[i][j];
                    const intensity = Math.min(255, weight * 255);
                    const arch = this.architectures[this.currentArch];
                    const rgb = this.hexToRgb(arch.color);
                    
                    this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${weight})`;
                    this.ctx.fillRect(x, y, cellSize, cellSize);
                }
                
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                this.ctx.lineWidth = 0.5;
                this.ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }
        
        // Label
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Attention Pattern', startX, startY - 10);
        
        // Highlight current token if animating
        if (this.isAnimating && this.currentTokenIndex < maxTokens) {
            const highlightX = startX + this.currentTokenIndex * cellSize;
            const highlightY = startY + this.currentTokenIndex * cellSize;
            
            this.ctx.strokeStyle = this.colors.attention;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(highlightX - 1, startY - 1, cellSize + 2, maxTokens * cellSize + 2);
            this.ctx.strokeRect(startX - 1, highlightY - 1, maxTokens * cellSize + 2, cellSize + 2);
        }
    }
    
    drawMemoryVisualization() {
        const startX = 50;
        const startY = 250;
        const barWidth = 200;
        const barHeight = 20;
        
        const arch = this.architectures[this.currentArch];
        
        // Memory usage bar
        this.ctx.fillStyle = arch.color;
        this.ctx.fillRect(startX, startY, barWidth * arch.memoryMultiplier, barHeight);
        this.ctx.strokeStyle = this.colors.border;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(startX, startY, barWidth, barHeight);
        
        // Labels
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Memory Usage: ${(arch.memoryMultiplier * 100).toFixed(0)}%`, startX, startY - 5);
        this.ctx.fillText(`KV Cache: ${(4 * arch.memoryMultiplier).toFixed(1)}MB`, startX, startY + 35);
        
        // Efficiency indicator
        if (arch.memoryMultiplier < 1.0) {
            const savings = Math.round((1 - arch.memoryMultiplier) * 100);
            this.ctx.fillStyle = this.colors.attention;
            this.ctx.fillText(`${savings}% Memory Saved`, startX + barWidth + 20, startY + barHeight/2 + 3);
        }
    }
    
    drawArchitectureSpecs() {
        const startX = 700;
        const startY = 200;
        const arch = this.architectures[this.currentArch];
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Architecture Details:', startX, startY);
        
        this.ctx.font = '11px Arial';
        const details = [
            `Query Heads: ${arch.numHeads}`,
            `Key-Value Heads: ${arch.kvHeads}`,
            `Memory Efficiency: ${Math.round((1 - arch.memoryMultiplier) * 100)}% reduction`,
            `Implementation: ${arch.description}`,
        ];
        
        details.forEach((detail, i) => {
            this.ctx.fillText(detail, startX, startY + 25 + i * 16);
        });
        
        // Trade-offs
        this.ctx.fillStyle = arch.color;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText('Trade-offs:', startX, startY + 110);
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '10px Arial';
        
        const tradeoffs = this.getArchitectureTradeoffs(this.currentArch);
        tradeoffs.forEach((tradeoff, i) => {
            this.ctx.fillText(`• ${tradeoff}`, startX, startY + 130 + i * 14);
        });
        
        // Current processing status
        if (this.isAnimating && this.tokens.length > 0) {
            this.ctx.fillStyle = arch.color;
            this.ctx.font = '11px Arial';
            this.ctx.fillText(`Processing: "${this.tokens[this.currentTokenIndex].text}"`, startX, startY + 210);
        }
    }
    
    getArchitectureTradeoffs(arch) {
        const tradeoffs = {
            mha: [
                'Highest memory usage',
                'Best modeling capacity', 
                'Slowest inference',
                'Full expressiveness'
            ],
            mqa: [
                'Lowest memory usage',
                'Fastest inference',
                'Some quality loss',
                'Simple implementation'
            ],
            gqa: [
                'Balanced memory/quality',
                'Moderate speedup',
                'Good practical choice',
                'Industry standard'
            ]
        };
        return tradeoffs[arch] || [];
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 255, g: 107, b: 107};
    }
    
    // Method to get current architecture info for analytics
    getCurrentArchInfo() {
        return this.architectures[this.currentArch];
    }
}