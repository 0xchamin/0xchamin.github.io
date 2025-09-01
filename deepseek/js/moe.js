class MoEVisualizer {
    constructor(ctx, canvas) {
        console.log('Visualizer loaded')
        this.ctx = ctx;
        this.canvas = canvas;
        
        // Constants
        this.EXPERT_COUNT = 32;
        this.ROUTED_EXPERTS_COUNT = 8;
        this.SHARED_EXPERT_INDEX = 0;
        this.FRAMES_PER_TOKEN = 32;
        this.MAX_DISPLAYED_TOKENS = 21;
        
        // State
        this.selectedExperts = [];
        this.tokens = [];
        this.animationFrame = 0;
        this.currentTokenIndex = 0;
        this.isAnimating = false;
        
        // Colors - following technical dark theme
        this.colors = {
            expert: '#6C5CE7',              // Purple for regular experts
            selectedExpert: '#00FF7F',      // Bright green for selected
            sharedExpert: '#FD79A8',        // Pink for shared expert
            router: '#FDCB6E',              // Yellow for router
            inactive: '#74B9FF',            // Light blue for inactive
            activeToken: '#FFD700',         // Gold for current token
            processedToken: '#00FF7F',      // Green for processed
            background: '#1a1a1a',          // Dark background
            text: '#FFFFFF',                // White text
            border: '#FFFFFF'               // White borders
        };
        
        // Expert specializations for educational purposes
        this.expertTypes = {
            math: [8, 16, 24],              // Math-related experts
            language: [1, 9, 17, 25],       // Language processing
            vision: [2, 10, 18, 26],        // Visual/spatial
            logic: [3, 11, 19, 27],         // Logical reasoning  
            code: [4, 12, 20, 28],          // Code understanding
            memory: [5, 13, 21, 29],        // Memory/context
            audio: [6, 14, 22, 30],         // Audio processing
            reasoning: [7, 15, 23, 31]      // General reasoning
        };
        
        this.expertLabels = [
            'Math', 'Lang', 'Vision', 'Logic', 'Code', 'Memory', 'Audio', 'Reasoning'
        ];
    }
    
    setExpertCount(count) {
        this.EXPERT_COUNT = Math.min(count, 32);
        this.render();
    }
    
    processTokens(tokens) {
        this.tokens = tokens.slice(0, this.MAX_DISPLAYED_TOKENS);
        this.resetAnimation();
        this.startAnimation();
    }
    
    resetAnimation() {
        this.animationFrame = 0;
        this.currentTokenIndex = 0;
        this.selectedExperts = [];
        this.isAnimating = false;
    }
    
    startAnimation() {
        if (this.tokens.length === 0) return;
        
        this.isAnimating = true;
        this.animate();
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        const maxFrames = this.tokens.length * this.FRAMES_PER_TOKEN + 20;
        
        if (this.animationFrame > maxFrames) {
            this.isAnimating = false;
            return;
        }
        
        // Update current token index
        const newTokenIndex = Math.min(
            Math.floor(this.animationFrame / this.FRAMES_PER_TOKEN), 
            this.tokens.length - 1
        );
        
        if (newTokenIndex !== this.currentTokenIndex && newTokenIndex < this.tokens.length) {
            this.currentTokenIndex = newTokenIndex;
            this.selectedExperts = this.selectExpertsForToken(this.tokens[newTokenIndex]);
        }
        
        this.render();
        this.animationFrame++;
        
        if (this.isAnimating) {
            requestAnimationFrame(() => this.animate());
        }
    }
    
    selectExpertsForToken(token) {
        const selectedExperts = new Set();
        const hash = this.simpleHash(token.text);
        
        // Step 1: Add 2-3 semantically relevant experts first
        const semanticExperts = this.getSemanticExperts(token.text);
        const numSemantic = Math.min(3, semanticExperts.length);
        for (let i = 0; i < numSemantic; i++) {
            if (semanticExperts[i] !== this.SHARED_EXPERT_INDEX) {
                selectedExperts.add(semanticExperts[i]);
            }
        }
        
        // Step 2: Fill remaining slots with realistic scattered selection
        // Create a shuffled list of all available experts (excluding shared expert)
        const availableExperts = [];
        for (let i = 1; i < this.EXPERT_COUNT; i++) { // Start from 1 to skip shared expert
            availableExperts.push(i);
        }
        
        // Shuffle the list deterministically based on token hash
        this.shuffleArray(availableExperts, hash);
        
        // Select from shuffled list, skipping already selected experts
        for (const expert of availableExperts) {
            if (selectedExperts.size >= this.ROUTED_EXPERTS_COUNT) break;
            
            if (!selectedExperts.has(expert)) {
                selectedExperts.add(expert);
            }
        }
        
        return Array.from(selectedExperts).slice(0, this.ROUTED_EXPERTS_COUNT);
    }
    
    shuffleArray(array, seed) {
        // Fisher-Yates shuffle with deterministic seed
        for (let i = array.length - 1; i > 0; i--) {
            // Generate pseudo-random index based on seed and position
            const j = ((seed * (i + 1) * 1103515245 + 12345) >>> 0) % (i + 1);
            [array[i], array[j]] = [array[j], array[i]];
            seed = ((seed * 1664525 + 1013904223) >>> 0); // Update seed for next iteration
        }
    }
    
    getSemanticExperts(text) {
        const experts = [];
        const lowerText = text.toLowerCase();
        const hash = this.simpleHash(text);
        
        // Get primary expert type based on semantic content
        let primaryType = null;
        if (/\d+|number|count|calculate|math|sum|add/.test(lowerText)) {
            primaryType = 'math';
        } else if (/color|see|look|visual|image|picture/.test(lowerText)) {
            primaryType = 'vision';
        } else if (/think|because|why|reason|logic/.test(lowerText)) {
            primaryType = 'reasoning';
        } else if (/code|program|function|debug|script/.test(lowerText)) {
            primaryType = 'code';
        } else if (/the|a|an|is|are|was|were|and|or/.test(lowerText)) {
            primaryType = 'language';
        }
        
        // Select 2-3 experts from primary type
        if (primaryType && this.expertTypes[primaryType]) {
            const typeExperts = this.expertTypes[primaryType];
            const numPrimary = Math.min(3, typeExperts.length);
            for (let i = 0; i < numPrimary; i++) {
                const expertIndex = typeExperts[(hash + i) % typeExperts.length];
                if (expertIndex !== this.SHARED_EXPERT_INDEX) {
                    experts.push(expertIndex);
                }
            }
        }
        
        // Add 1-2 experts from secondary types for diversity
        const allTypes = Object.keys(this.expertTypes);
        const secondaryTypes = allTypes.filter(type => type !== primaryType);
        
        for (let i = 0; i < 2 && experts.length < 5; i++) {
            const typeIndex = (hash + i) % secondaryTypes.length;
            const secondaryType = secondaryTypes[typeIndex];
            const typeExperts = this.expertTypes[secondaryType];
            const expertIndex = typeExperts[(hash + i + 7) % typeExperts.length];
            
            if (expertIndex !== this.SHARED_EXPERT_INDEX && !experts.includes(expertIndex)) {
                experts.push(expertIndex);
            }
        }
        
        return experts;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawTitle();
        this.drawTokenFlow();
        this.drawExpertGrid();
        this.drawRouter();
        this.drawConnections();
        this.drawLegend();
        this.drawProcessingIndicator();
        this.drawMetrics();
    }
    
    drawTitle() {
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('DeepSeek V3 - Mixture of Experts Visualization', this.canvas.width / 2, 30);
    }
    
    drawTokenFlow() {
        if (this.tokens.length === 0) return;
        
        const startY = 70;
        const tokenWidth = 80;
        const tokenHeight = 30;
        const spacing = 10;
        const startX = 50;
        
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        
        this.tokens.forEach((token, i) => {
            const x = startX + i * (tokenWidth + spacing);
            
            let fillColor, borderColor, textColor;
            
            if (i === this.currentTokenIndex && this.isAnimating) {
                // Current token being processed
                fillColor = 'rgba(255, 215, 0, 0.6)';
                borderColor = this.colors.activeToken;
                textColor = this.colors.activeToken;
            } else if (i < this.currentTokenIndex) {
                // Already processed tokens
                fillColor = 'rgba(0, 255, 127, 0.3)';
                borderColor = this.colors.processedToken;
                textColor = this.colors.processedToken;
            } else {
                // Unprocessed tokens
                fillColor = 'rgba(253, 203, 110, 0.3)';
                borderColor = this.colors.router;
                textColor = this.colors.router;
            }
            
            this.ctx.fillStyle = fillColor;
            this.ctx.fillRect(x, startY, tokenWidth, tokenHeight);
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, startY, tokenWidth, tokenHeight);
            
            this.ctx.fillStyle = textColor;
            this.ctx.fillText(token.text, x + tokenWidth/2, startY + tokenHeight/2 + 4);
        });
    }
    
    drawExpertGrid() {
        const cols = 8;
        const rows = Math.ceil(this.EXPERT_COUNT / cols);
        const expertSize = 60;
        const spacing = 10;
        const startX = 50;
        const startY = 150;
        
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        
        for (let i = 0; i < this.EXPERT_COUNT; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * (expertSize + spacing);
            const y = startY + row * (expertSize + spacing);
            
            let fillColor, borderColor, label;
            
            if (i === this.SHARED_EXPERT_INDEX) {
                // Shared expert - always active
                fillColor = this.colors.sharedExpert;
                borderColor = this.colors.border;
                label = `S${i}`;
                
                // Pulsing effect when processing
                if (this.isAnimating && this.currentTokenIndex < this.tokens.length) {
                    const pulse = Math.sin(this.animationFrame * 0.2) * 0.3 + 0.7;
                    this.ctx.globalAlpha = pulse;
                }
            } else if (this.selectedExperts.includes(i)) {
                // Selected routed experts
                fillColor = this.colors.selectedExpert;
                borderColor = this.colors.border;
                label = `E${i}`;
                
                // Pulsing effect when processing
                if (this.isAnimating && this.currentTokenIndex < this.tokens.length) {
                    const pulse = Math.sin(this.animationFrame * 0.2) * 0.3 + 0.7;
                    this.ctx.globalAlpha = pulse;
                }
            } else {
                // Inactive experts
                fillColor = this.colors.inactive;
                borderColor = this.colors.border;
                label = `E${i}`;
            }
            
            // Draw expert box
            this.ctx.fillStyle = fillColor;
            this.ctx.fillRect(x, y, expertSize, expertSize);
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, expertSize, expertSize);
            
            this.ctx.globalAlpha = 1.0; // Reset alpha
            
            // Draw expert label
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText(label, x + expertSize/2, y + expertSize/2 - 5);
            
            // Draw specialization
            this.ctx.font = '8px Arial';
            const specialization = this.expertLabels[i % this.expertLabels.length];
            this.ctx.fillText(specialization, x + expertSize/2, y + expertSize/2 + 8);
        }
    }
    
    drawRouter() {
        const x = 600;
        const y = 200;
        const width = 150;
        const height = 100;
        
        // Pulsing effect during processing
        if (this.isAnimating && this.currentTokenIndex < this.tokens.length) {
            const pulse = Math.sin(this.animationFrame * 0.3) * 0.2 + 0.8;
            this.ctx.globalAlpha = pulse;
        }
        
        this.ctx.fillStyle = this.colors.router;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = this.colors.border;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        this.ctx.globalAlpha = 1.0;
        
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Router', x + width/2, y + height/2 - 10);
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Top-8 + Shared', x + width/2, y + height/2 + 10);
    }
    
    drawConnections() {
        if (!this.isAnimating || this.currentTokenIndex >= this.tokens.length) return;
        
        const routerCenterX = 675;
        const routerCenterY = 250;
        const expertSize = 60;
        const spacing = 10;
        const startX = 50;
        const startY = 150;
        
        // Draw connections to selected experts
        this.selectedExperts.forEach(expertIdx => {
            const col = expertIdx % 8;
            const row = Math.floor(expertIdx / 8);
            const expertCenterX = startX + col * (expertSize + spacing) + expertSize/2;
            const expertCenterY = startY + row * (expertSize + spacing) + expertSize/2;
            
            this.ctx.strokeStyle = this.colors.selectedExpert;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(routerCenterX, routerCenterY);
            this.ctx.lineTo(expertCenterX, expertCenterY);
            this.ctx.stroke();
        });
        
        // Draw connection to shared expert (always active)
        const sharedCenterX = startX + expertSize/2;
        const sharedCenterY = startY + expertSize/2;
        
        this.ctx.strokeStyle = this.colors.sharedExpert;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(routerCenterX, routerCenterY);
        this.ctx.lineTo(sharedCenterX, sharedCenterY);
        this.ctx.stroke();
    }
    
    drawLegend() {
        const x = 850;
        const y = 150;
        const itemHeight = 25;
        
        const legendItems = [
            { color: this.colors.sharedExpert, label: 'Shared Expert (Always Active)' },
            { color: this.colors.selectedExpert, label: 'Selected Experts (8 routed)' },
            { color: this.colors.inactive, label: 'Inactive Experts' },
            { color: this.colors.router, label: 'Router Network' },
            { color: this.colors.activeToken, label: 'Current Token' },
            { color: this.colors.processedToken, label: 'Processed Token' }
        ];
        
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        
        legendItems.forEach((item, i) => {
            const itemY = y + i * itemHeight;
            
            // Draw color box
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(x, itemY, 18, 18);
            this.ctx.strokeStyle = this.colors.border;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, itemY, 18, 18);
            
            // Draw label
            this.ctx.fillStyle = this.colors.text;
            this.ctx.fillText(item.label, x + 25, itemY + 13);
        });
    }
    
    drawProcessingIndicator() {
        if (this.tokens.length === 0) return;
        
        const x = 50;
        const y = 120;
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        if (this.isAnimating && this.currentTokenIndex < this.tokens.length) {
            const currentToken = this.tokens[this.currentTokenIndex];
            this.ctx.fillText(
                `Processing token ${this.currentTokenIndex + 1} of ${this.tokens.length}: "${currentToken.text}"`,
                x, y
            );
        } else if (this.currentTokenIndex >= this.tokens.length) {
            this.ctx.fillText('Processing complete! All tokens routed through MoE.', x, y);
        }
    }

    drawMetrics() {
        const x = 850;
        const y = 350;
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('DeepSeek V3 Metrics:', x, y);
        
        this.ctx.font = '12px Arial';
        const metrics = [
            `Total Parameters: 671B`,
            `Active per Token: 37B (${Math.round(37/671*100)}%)`,
            `Routed Experts: ${this.ROUTED_EXPERTS_COUNT}`,
            `Shared Experts: 1 (always active)`,
            `Total Experts: ${this.EXPERT_COUNT} (simplified)`,
            `Efficiency: ${Math.round((1 - 37/671) * 100)}% parameter savings`
        ];
        
        metrics.forEach((metric, i) => {
            this.ctx.fillText(metric, x, y + 25 + i * 18);
        });
        
        // Educational explanation
        this.drawEducationalExplanation();
    }
    
    drawEducationalExplanation() {
        const x = 1065;
        const y = 400; // Moved up to avoid overlap with metrics
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🎓 AI Professor Explains:', x, y);
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '10px Arial'; // Smaller font to fit better
        
        if (this.isAnimating && this.currentTokenIndex < this.tokens.length) {
            const currentToken = this.tokens[this.currentTokenIndex];
            const explanations = [
                `Processing: "${currentToken.text}"`,
                '',
                'What\'s happening:',
                '• Router analyzes semantics',
                '• Selects 8 relevant experts',
                '• Shared expert participates',
                '• Only 9/256 experts active',
                '',
                'Why efficient:',
                '• 94% parameters dormant',
                '• Massive computation savings',
                '• Quality maintained'
            ];
            
            explanations.forEach((line, i) => {
                if (line.startsWith('What\'s') || line.startsWith('Why')) {
                    this.ctx.fillStyle = '#4ECDC4';
                    this.ctx.font = 'bold 10px Arial';
                } else {
                    this.ctx.fillStyle = this.colors.text;
                    this.ctx.font = '10px Arial';
                }
                this.ctx.fillText(line, x, y + 25 + i * 12);
            });
        } else {
            const staticExplanation = [
                'MoE like a university:',
                '• 256 expert professors',
                '• Each has specialization',
                '• Consult only 8 relevant ones',
                '• Plus 1 dean (shared expert)',
                '',
                'Result: Expert knowledge,',
                'fraction of the cost!'
            ];
            
            staticExplanation.forEach((line, i) => {
                if (line.includes('MoE') || line.includes('Result:')) {
                    this.ctx.fillStyle = '#4ECDC4';
                    this.ctx.font = 'bold 10px Arial';
                } else {
                    this.ctx.fillStyle = this.colors.text;
                    this.ctx.font = '10px Arial';
                }
                this.ctx.fillText(line, x, y + 25 + i * 12);
            });
        }
    }
    
    
    
    drawMetricsOld() {
        const x = 850;
        const y = 350;
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('DeepSeek V3 Metrics:', x, y);
        
        this.ctx.font = '12px Arial';
        const metrics = [
            `Total Parameters: 671B`,
            `Active per Token: 37B (${Math.round(37/671*100)}%)`,
            `Routed Experts: ${this.ROUTED_EXPERTS_COUNT}`,
            `Shared Experts: 1 (always active)`,
            `Total Experts: ${this.EXPERT_COUNT} (simplified)`,
            `Efficiency: ${Math.round((1 - 37/671) * 100)}% parameter savings`
        ];
        
        metrics.forEach((metric, i) => {
            this.ctx.fillText(metric, x, y + 25 + i * 18);
        });
    }
    
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
        }
        return Math.abs(hash);
    }
}