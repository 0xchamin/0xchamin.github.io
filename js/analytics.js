class AnalyticsVisualizer {
    constructor() {
        console.log('Visualizer loaded')
        this.memoryCanvas = document.getElementById('memory-chart');
        this.performanceCanvas = document.getElementById('performance-chart');
        this.memoryCtx = this.memoryCanvas ? this.memoryCanvas.getContext('2d') : null;
        this.performanceCtx = this.performanceCanvas ? this.performanceCanvas.getContext('2d') : null;
        
        // Current comparison architecture
        this.comparisonArch = 'gqa';
        
        // Colors
        this.colors = {
            mla: '#4ECDC4',
            comparison: '#FF6B6B',
            background: '#1a1a1a',
            text: '#FFFFFF',
            grid: 'rgba(255, 255, 255, 0.1)'
        };
        
        // Architecture data
        this.archData = {
            mla: {
                memory: 1.0,
                speed: 2.3,
                quality: 98.5,
                efficiency: 75
            },
            mha: {
                memory: 4.0,
                speed: 1.0,
                quality: 100,
                efficiency: 0
            },
            mqa: {
                memory: 1.2,
                speed: 2.8,
                quality: 94.2,
                efficiency: 70
            },
            gqa: {
                memory: 2.0,
                speed: 1.8,
                quality: 97.1,
                efficiency: 50
            }
        };
    }
    
    setComparisonArchitecture(arch) {
        this.comparisonArch = arch;
        this.updateCharts();
        this.updateTextualMetrics();
        this.updateComparisonLabels(arch);
    }
    
    updateCharts() {
        if (this.memoryCtx) this.drawMemoryChart();
        if (this.performanceCtx) this.drawPerformanceChart();
    }
    
    drawMemoryChart() {
        const ctx = this.memoryCtx;
        const canvas = this.memoryCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Chart dimensions
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        const barWidth = chartWidth / 3;
        const maxMemory = 4.5; // Max memory for scaling
        
        // Get data
        const mlaMemory = this.archData.mla.memory;
        const compMemory = this.archData[this.comparisonArch].memory;
        
        // Draw grid lines
        this.drawGrid(ctx, padding, chartWidth, chartHeight, maxMemory);
        
        // Draw bars
        const bar1X = padding + barWidth * 0.25;
        const bar2X = padding + barWidth * 1.25;
        
        // MLA bar
        const mlaHeight = (mlaMemory / maxMemory) * chartHeight;
        ctx.fillStyle = this.colors.mla;
        ctx.fillRect(bar1X, padding + chartHeight - mlaHeight, barWidth * 0.5, mlaHeight);
        
        // Comparison bar
        const compHeight = (compMemory / maxMemory) * chartHeight;
        ctx.fillStyle = this.colors.comparison;
        ctx.fillRect(bar2X, padding + chartHeight - compHeight, barWidth * 0.5, compHeight);
        
        // Add value labels on bars
        ctx.fillStyle = this.colors.text;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${mlaMemory.toFixed(1)}MB`, bar1X + barWidth * 0.25, padding + chartHeight - mlaHeight - 5);
        ctx.fillText(`${compMemory.toFixed(1)}MB`, bar2X + barWidth * 0.25, padding + chartHeight - compHeight - 5);
        
        // Draw x-axis labels
        ctx.fillStyle = this.colors.text;
        ctx.font = '11px Arial';
        ctx.fillText('DeepSeek MLA', bar1X + barWidth * 0.25, padding + chartHeight + 20);
        ctx.fillText(this.getArchName(this.comparisonArch), bar2X + barWidth * 0.25, padding + chartHeight + 20);
        
        // Y-axis label
        ctx.save();
        ctx.translate(15, padding + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Memory Usage (MB)', 0, 0);
        ctx.restore();
    }
    
    drawPerformanceChart() {
        const ctx = this.performanceCtx;
        const canvas = this.performanceCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Chart dimensions
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        
        // Get data points
        const mlaData = this.archData.mla;
        const compData = this.archData[this.comparisonArch];
        
        // Scales
        const maxSpeed = 3.0;
        const maxQuality = 100;
        
        // Calculate positions
        const mlaX = padding + (mlaData.speed / maxSpeed) * chartWidth;
        const mlaY = padding + chartHeight - (mlaData.quality / maxQuality) * chartHeight;
        const compX = padding + (compData.speed / maxSpeed) * chartWidth;
        const compY = padding + chartHeight - (compData.quality / maxQuality) * chartHeight;
        
        // Draw grid
        this.drawPerformanceGrid(ctx, padding, chartWidth, chartHeight);
        
        // Draw points
        ctx.fillStyle = this.colors.mla;
        ctx.beginPath();
        ctx.arc(mlaX, mlaY, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = this.colors.comparison;
        ctx.beginPath();
        ctx.arc(compX, compY, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add labels
        ctx.fillStyle = this.colors.text;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MLA', mlaX, mlaY - 12);
        ctx.fillText(this.comparisonArch.toUpperCase(), compX, compY - 12);
        
        // Axes labels
        ctx.font = '11px Arial';
        ctx.fillText('Inference Speed (relative)', padding + chartWidth / 2, canvas.height - 5);
        
        ctx.save();
        ctx.translate(15, padding + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Quality Score (%)', 0, 0);
        ctx.restore();
    }
    
    drawGrid(ctx, padding, chartWidth, chartHeight, maxValue) {
        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 4; i++) {
            const y = padding + (i / 4) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
            
            // Y-axis labels
            const value = maxValue - (i / 4) * maxValue;
            ctx.fillStyle = this.colors.text;
            ctx.font = '9px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(1), padding - 10, y + 3);
        }
    }
    
    drawPerformanceGrid(ctx, padding, chartWidth, chartHeight) {
        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1;
        
        // Grid lines
        for (let i = 0; i <= 4; i++) {
            // Vertical lines (speed)
            const x = padding + (i / 4) * chartWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + chartHeight);
            ctx.stroke();
            
            // Horizontal lines (quality)
            const y = padding + (i / 4) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }
        
        // Axis labels
        ctx.fillStyle = this.colors.text;
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        
        // X-axis (speed)
        for (let i = 0; i <= 4; i++) {
            const x = padding + (i / 4) * chartWidth;
            const value = (i / 4) * 3.0;
            ctx.fillText(value.toFixed(1) + 'x', x, padding + chartHeight + 15);
        }
        
        // Y-axis (quality)
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const y = padding + (i / 4) * chartHeight;
            const value = 100 - (i / 4) * 100;
            ctx.fillText(value.toFixed(0) + '%', padding - 10, y + 3);
        }
    }
    
    updateTextualMetrics() {
        const mlaData = this.archData.mla;
        const compData = this.archData[this.comparisonArch];
        
        // Calculate relative improvements
        const speedImprovement = ((mlaData.speed - compData.speed) / compData.speed * 100).toFixed(1);
        const memoryImprovement = ((compData.memory - mlaData.memory) / compData.memory * 100).toFixed(1);
        const qualityChange = (mlaData.quality - compData.quality).toFixed(1);
        
        // Update DOM elements
        const speedElement = document.getElementById('speed-comparison');
        const memoryElement = document.getElementById('memory-efficiency');
        const qualityElement = document.getElementById('quality-score');
        
        if (speedElement) {
            speedElement.textContent = speedImprovement > 0 ? `${speedImprovement}% faster` : `${Math.abs(speedImprovement)}% slower`;
        }
        
        if (memoryElement) {
            memoryElement.textContent = `${memoryImprovement}% reduction`;
        }
        
        if (qualityElement) {
            const qualityText = qualityChange >= 0 ? `+${qualityChange}% better` : `${qualityChange}% maintained`;
            qualityElement.textContent = qualityText;
        }
    }
    
    updateComparisonLabels(arch) {
        const archName = this.getArchName(arch);
        
        // Update legend
        const comparisonLegend = document.getElementById('comparison-legend');
        if (comparisonLegend) {
            comparisonLegend.textContent = arch.toUpperCase();
        }
        
        // Update summary section
        const comparisonTitle = document.getElementById('comparison-summary-title');
        if (comparisonTitle) {
            comparisonTitle.textContent = archName;
        }
        
        // Update feature list
        const featuresList = document.getElementById('comparison-features');
        if (featuresList) {
            const features = this.getArchitectureFeatures(arch);
            featuresList.innerHTML = features.map(feature => `<li>${feature}</li>`).join('');
        }
    }
    
    getArchName(arch) {
        const names = {
            mha: 'Multi-Head Attention',
            mqa: 'Multi-Query Attention', 
            gqa: 'Grouped Query Attention'
        };
        return names[arch] || arch.toUpperCase();
    }
    
    getArchitectureFeatures(arch) {
        const features = {
            mha: [
                'Full attention heads',
                'Highest memory usage',
                'Best modeling capacity',
                'Baseline performance'
            ],
            mqa: [
                'Single KV head shared',
                'Lowest memory usage',
                'Fastest inference',
                'Some quality trade-off'
            ],
            gqa: [
                'Grouped key-value heads',
                'Moderate memory savings',
                'Balanced performance',
                'Industry standard'
            ]
        };
        return features[arch] || [];
    }
    
    // Method to animate chart updates
    animateToNewData() {
        // Could add smooth transitions between architectures
        this.updateCharts();
    }
}