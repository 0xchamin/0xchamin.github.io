class MLAVisualizer {
    constructor(ctx, canvas) {
        console.log('Visualizer loaded')
        this.ctx = ctx;
        this.canvas = canvas;
        
        // Constants
        this.COMPRESSION_RATIO = 4;
        this.LATENT_DIM = 128;
        this.ORIGINAL_DIM = 512;
        
        // State
        this.tokens = [];
        this.currentTokenIndex = 0;
        this.animationFrame = 0;
        this.isAnimating = false;
        this.compressionProgress = 0;
        this.attentionWeights = null;
        
        // Colors - matching DeepSeek technical theme
        this.colors = {
            query: '#4ECDC4',              // Cyan for queries
            key: '#FF6B6B',                // Red for keys
            value: '#FFE66D',              // Yellow for values
            compressed: '#A8E6CF',         // Light green for compressed
            latent: '#DDA0DD',             // Plum for latent space
            attention: '#00FF7F',          // Bright green for attention
            background: '#1a1a1a',         // Dark background
            text: '#FFFFFF',               // White text
            border: '#FFFFFF',             // White borders
            memoryEfficient: '#32CD32',    // Lime green for efficiency
            traditional: '#FF4500'         // Orange red for traditional
        };
    }
    
    setCompressionRatio(ratio) {
        this.COMPRESSION_RATIO = ratio;
        this.render();
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
        this.compressionProgress = 0;
        this.isAnimating = false;
    }
    
    startAnimation() {
        if (this.tokens.length === 0) return;
        
        this.isAnimating = true;
        this.animate();
    }
    
    // animate() {
    //     if (!this.isAnimating) return;
        
    //     const maxFrames = 150;
        
    //     if (this.animationFrame > maxFrames) {
    //         this.isAnimating = false;
    //         return;
    //     }
        
    //     // Update compression progress
    //     this.compressionProgress = Math.min(this.animationFrame / 60, 1.0);
        
    //     // Update current token
    //     if (this.tokens.length > 0) {
    //         this.currentTokenIndex = Math.floor((this.animationFrame / 10) % this.tokens.length);
    //     }
        
    //     this.render();
    //     this.animationFrame++;
        
    //     if (this.isAnimating) {
    //         requestAnimationFrame(() => this.animate());
    //     }
    // }
    animate() {
        if (!this.isAnimating) return;
        
        // Calculate frames based on token count for exactly one complete cycle
        const framesPerToken = 10;
        const maxFrames = this.tokens.length * framesPerToken + 30; // +30 for completion buffer
        
        if (this.animationFrame > maxFrames) {
            this.isAnimating = false;
            return;
        }
        
        // Update compression progress
        this.compressionProgress = Math.min(this.animationFrame / 60, 1.0);
        
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
        // Generate realistic attention weights for visualization
        this.attentionWeights = [];
        for (let i = 0; i < this.tokens.length; i++) {
            const weights = [];
            for (let j = 0; j < this.tokens.length; j++) {
                // Simulate attention decay with distance and some randomness
                const distance = Math.abs(i - j);
                const baseWeight = Math.exp(-distance * 0.3);
                const noise = (Math.random() - 0.5) * 0.2;
                weights.push(Math.max(0.1, baseWeight + noise));
            }
            // Normalize weights
            const sum = weights.reduce((a, b) => a + b, 0);
            this.attentionWeights.push(weights.map(w => w / sum));
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawTitle();
        this.drawMLAPipeline();
        this.drawTokenFlow();
        this.drawCompressionVisualization();
        this.drawMemoryComparison();
        this.drawPerformanceMetrics();
    }
    
    drawTitle() {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DeepSeek V3 - Multi-Head Latent Attention (MLA)', this.canvas.width / 2, 30);
    }
    
    drawMLAPipeline() {
        const startX = 50;
        const startY = 70;
        const stageWidth = 120;
        const stageHeight = 80;
        const spacing = 40;
        
        // Pipeline stages
        const stages = [
            { label: 'Input\nTokens', color: this.colors.text },
            { label: 'Query (Q)\nProjection', color: this.colors.query },
            { label: 'Key-Value\nProjection', color: this.colors.key },
            { label: 'KV\nCompression', color: this.colors.compressed },
            { label: 'Latent\nAttention', color: this.colors.latent },
            { label: 'Output\nProjection', color: this.colors.attention }
        ];
        
        stages.forEach((stage, i) => {
            const x = startX + i * (stageWidth + spacing);
            const y = startY;
            
            // Stage background with pulsing effect for active stage
            let alpha = 0.3;
            if (this.isAnimating) {
                const activeStage = Math.floor((this.animationFrame / 20) % stages.length);
                if (i === activeStage) {
                    alpha = 0.7 + Math.sin(this.animationFrame * 0.2) * 0.2;
                }
            }
            
            this.ctx.fillStyle = stage.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.fillRect(x, y, stageWidth, stageHeight);
            this.ctx.strokeStyle = stage.color;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, stageWidth, stageHeight);
            
            // Stage label
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            const lines = stage.label.split('\n');
            lines.forEach((line, lineIndex) => {
                this.ctx.fillText(line, x + stageWidth/2, y + stageHeight/2 + (lineIndex - 0.5) * 15);
            });
            
            // Draw arrow to next stage
            if (i < stages.length - 1) {
                const arrowX = x + stageWidth + 10;
                const arrowY = y + stageHeight/2;
                
                this.ctx.strokeStyle = this.colors.attention;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(arrowX, arrowY);
                this.ctx.lineTo(arrowX + 20, arrowY);
                this.ctx.stroke();
                
                // Arrow head
                this.ctx.beginPath();
                this.ctx.moveTo(arrowX + 15, arrowY - 5);
                this.ctx.lineTo(arrowX + 20, arrowY);
                this.ctx.lineTo(arrowX + 15, arrowY + 5);
                this.ctx.stroke();
            }
        });
    }
    
    drawTokenFlow() {
        if (this.tokens.length === 0) return;
        
        const startX = 50;
        const startY = 180;
        const tokenWidth = 60;
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
                textColor = '#000';
            } else {
                fillColor = 'rgba(76, 205, 196, 0.3)';
                borderColor = this.colors.query;
                textColor = this.colors.query;
            }
            
            this.ctx.fillStyle = fillColor;
            this.ctx.fillRect(x, startY, tokenWidth, tokenHeight);
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, startY, tokenWidth, tokenHeight);
            
            this.ctx.fillStyle = textColor;
            this.ctx.fillText(token.text, x + tokenWidth/2, startY + tokenHeight/2 + 3);
        });
    }
    
    drawCompressionVisualization() {
        const startX = 50;
        const startY = 230;
        
        // Original K,V matrices
        this.drawMatrix(startX, startY, 'Original K', this.colors.key, 80, 60, 1.0);
        this.drawMatrix(startX + 100, startY, 'Original V', this.colors.value, 80, 60, 1.0);
        
        // Compression arrow with progress
        const arrowX = startX + 200;
        const arrowY = startY + 30;
        const arrowLength = 80;
        
        this.ctx.strokeStyle = this.colors.compressed;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(arrowX + arrowLength * this.compressionProgress, arrowY);
        this.ctx.stroke();
        
        if (this.compressionProgress > 0.8) {
            // Arrow head
            this.ctx.beginPath();
            this.ctx.moveTo(arrowX + arrowLength - 10, arrowY - 5);
            this.ctx.lineTo(arrowX + arrowLength, arrowY);
            this.ctx.lineTo(arrowX + arrowLength - 10, arrowY + 5);
            this.ctx.stroke();
        }
        
        // Compression ratio label
        this.ctx.fillStyle = this.colors.compressed;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.COMPRESSION_RATIO}x Compression`, arrowX + arrowLength/2, arrowY - 15);
        
        // Compressed latent representation
        const compressedAlpha = this.compressionProgress;
        this.drawMatrix(startX + 300, startY + 10, 'Compressed\nLatent KV', this.colors.latent, 60, 40, compressedAlpha);
        
        // Show dimensionality reduction
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${this.ORIGINAL_DIM}d → ${this.LATENT_DIM}d`, startX + 300, startY + 80);
    }
    
    drawMatrix(x, y, label, color, width, height, alpha = 1.0) {
        // Matrix background
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = this.colors.border;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        
        // Matrix pattern (grid)
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
        const cellSize = 8;
        for (let i = cellSize; i < width; i += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + i, y);
            this.ctx.lineTo(x + i, y + height);
            this.ctx.stroke();
        }
        for (let i = cellSize; i < height; i += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + i);
            this.ctx.lineTo(x + width, y + i);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1.0;
        
        // Label
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        const lines = label.split('\n');
        lines.forEach((line, i) => {
            this.ctx.fillText(line, x + width/2, y + height/2 + (i - 0.5) * 10);
        });
    }
    
    drawMemoryComparison() {
        const startX = 500;
        const startY = 230;
        const barWidth = 200;
        const barHeight = 25;
        
        // Traditional attention memory usage
        this.ctx.fillStyle = this.colors.traditional;
        this.ctx.fillRect(startX, startY, barWidth, barHeight);
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Traditional Attention: 4MB KV Cache', startX, startY - 5);
        
        // MLA memory usage (compressed)
        const mlaWidth = barWidth / this.COMPRESSION_RATIO;
        this.ctx.fillStyle = this.colors.memoryEfficient;
        this.ctx.fillRect(startX, startY + 40, mlaWidth, barHeight);
        this.ctx.fillText(`MLA: ${(4/this.COMPRESSION_RATIO).toFixed(1)}MB KV Cache`, startX, startY + 35);
        
        // Memory saved
        this.ctx.fillStyle = this.colors.compressed;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText(`${Math.round((1 - 1/this.COMPRESSION_RATIO) * 100)}% Memory Saved!`, startX, startY + 85);
    }
    
    drawPerformanceMetrics() {
        const x = 800;
        const y = 230;
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('MLA Benefits:', x, y);
        
        this.ctx.font = '12px Arial';
        const metrics = [
            `• ${this.COMPRESSION_RATIO}x reduction in KV cache size`,
            `• Better performance than GQA`,
            `• Maintains modeling quality`,
            `• Faster inference with long sequences`,
            `• Enables larger context windows`,
            `• Reduced memory bandwidth usage`
        ];
        
        metrics.forEach((metric, i) => {
            this.ctx.fillText(metric, x, y + 25 + i * 18);
        });
        
        // Integration note
        this.ctx.fillStyle = this.colors.attention;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('→ Feeds into MoE Layer', x, y + 160);
        
        // Show current processing status
        if (this.isAnimating && this.tokens.length > 0) {
            this.ctx.fillStyle = this.colors.latent;
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`Processing: "${this.tokens[this.currentTokenIndex].text}"`, x, y + 185);
            this.ctx.fillText(`Compression: ${Math.round(this.compressionProgress * 100)}%`, x, y + 200);
        }
    }
}