class DeepSeekDemo {
    constructor() {
        console.log('Visualizer loaded')
        // Canvas initialization
        this.mlaCanvas = document.getElementById('mla-canvas');
        this.moeCanvas = document.getElementById('moe-canvas');
        this.comparisonCanvas = document.getElementById('comparison-canvas');
        this.mlaCtx = this.mlaCanvas.getContext('2d');
        this.moeCtx = this.moeCanvas.getContext('2d');
        this.comparisonCtx = this.comparisonCanvas ? this.comparisonCanvas.getContext('2d') : null;
        
        // Configuration parameters
        this.compressionRatio = 4;
        this.expertCount = 32;
        this.animationSpeed = 1.0;
        this.comparisonArch = 'gqa';
        this.inputText = "The quick brown fox jumps over the lazy dog";
        
        // Processing state
        this.isProcessing = false;
        this.currentTokens = [];
        
        // Initialize components
        this.initializeEventListeners();
        this.mla = new MLAVisualizer(this.mlaCtx, this.mlaCanvas);
        this.moe = new MoEVisualizer(this.moeCtx, this.moeCanvas);
        this.comparison = this.comparisonCtx ? new ComparisonVisualizer(this.comparisonCtx, this.comparisonCanvas) : null;
        this.analytics = new AnalyticsVisualizer();
        
        // Set initial canvas sizes
        this.setupCanvases();
        
        // Process initial input
        this.processInput();
    }
    
    setupCanvases() {
        // Set high DPI canvas rendering
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // MLA Canvas setup
        const mlaRect = this.mlaCanvas.getBoundingClientRect();
        this.mlaCanvas.width = mlaRect.width * devicePixelRatio;
        this.mlaCanvas.height = mlaRect.height * devicePixelRatio;
        this.mlaCtx.scale(devicePixelRatio, devicePixelRatio);
        
        // MoE Canvas setup
        const moeRect = this.moeCanvas.getBoundingClientRect();
        this.moeCanvas.width = moeRect.width * devicePixelRatio;
        this.moeCanvas.height = moeRect.height * devicePixelRatio;
        this.moeCtx.scale(devicePixelRatio, devicePixelRatio);
        
        // Comparison Canvas setup
        if (this.comparisonCanvas && this.comparisonCtx) {
            const comparisonRect = this.comparisonCanvas.getBoundingClientRect();
            this.comparisonCanvas.width = comparisonRect.width * devicePixelRatio;
            this.comparisonCanvas.height = comparisonRect.height * devicePixelRatio;
            this.comparisonCtx.scale(devicePixelRatio, devicePixelRatio);
        }
    }
    
    initializeEventListeners() {
        // Process button
        const processBtn = document.getElementById('process-btn');
        processBtn.addEventListener('click', () => {
            this.handleProcessClick();
        });
        
        // Enter key in input field
        const tokenInput = document.getElementById('token-input');
        tokenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleProcessClick();
            }
        });
        
        // Compression ratio slider
        const compressionSlider = document.getElementById('compression-slider');
        compressionSlider.addEventListener('input', (e) => {
            this.compressionRatio = parseInt(e.target.value);
            this.updateCompressionUI();
            this.mla.setCompressionRatio(this.compressionRatio);
        });
        
        // Animation speed slider
        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.animationSpeed = parseFloat(e.target.value);
                this.updateSpeedUI();
                this.updateAnimationSpeed();
            });
        }
        
        // Expert count selector
        const expertCountSelect = document.getElementById('expert-count');
        expertCountSelect.addEventListener('change', (e) => {
            this.expertCount = parseInt(e.target.value);
            this.moe.setExpertCount(this.expertCount);
        });
        
        // Comparison architecture selector
        const comparisonArchSelect = document.getElementById('comparison-arch');
        if (comparisonArchSelect) {
            comparisonArchSelect.addEventListener('change', (e) => {
                this.comparisonArch = e.target.value;
                this.updateComparisonArchitecture();
            });
        }
        
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetDemo();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportVisualization();
            });
        }
        
        // Toggle switches
        const mlaDetailsToggle = document.getElementById('mla-details');
        if (mlaDetailsToggle) {
            mlaDetailsToggle.addEventListener('change', (e) => {
                this.toggleMLADetails(e.target.checked);
            });
        }
        
        const moeDetailsToggle = document.getElementById('moe-details');
        if (moeDetailsToggle) {
            moeDetailsToggle.addEventListener('change', (e) => {
                this.toggleMoEDetails(e.target.checked);
            });
        }
        
        const comparisonDetailsToggle = document.getElementById('comparison-details');
        if (comparisonDetailsToggle) {
            comparisonDetailsToggle.addEventListener('change', (e) => {
                this.toggleComparisonDetails(e.target.checked);
            });
        }
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.debounce(() => {
                this.setupCanvases();
                this.refreshVisualizations();
            }, 250)();
        });
    }
    
    handleProcessClick() {
        if (this.isProcessing) return;
        
        const tokenInput = document.getElementById('token-input');
        const newText = tokenInput.value.trim();
        
        if (!newText) {
            this.showNotification('Please enter some text to process', 'warning');
            return;
        }
        
        this.inputText = newText;
        this.processInput();
    }
    
    processInput() {
        this.setProcessingState(true);
        
        try {
            // Tokenize input
            this.currentTokens = this.tokenize(this.inputText);
            
            // Update processing indicators
            this.updateProcessingIndicators();
            
            // Process through MLA
            setTimeout(() => {
                this.mla.processTokens(this.currentTokens);
                
                // Process through comparison architecture
                if (this.comparison) {
                    this.comparison.processTokens(this.currentTokens);
                }
                
                // Update analytics
                this.analytics.updateCharts();
                
                // Delay MoE processing to show sequential flow
                setTimeout(() => {
                    this.moe.processTokens(this.currentTokens);
                    this.updateMetrics();
                    this.setProcessingState(false);
                }, 500);
            }, 200);
            
        } catch (error) {
            console.error('Processing error:', error);
            this.showNotification('Error processing input', 'error');
            this.setProcessingState(false);
        }
    }
    
    updateComparisonArchitecture() {
        if (this.comparison) {
            this.comparison.setArchitecture(this.comparisonArch);
        }
        
        this.analytics.setComparisonArchitecture(this.comparisonArch);
        this.updateComparisonLabels();
        
        // Reprocess tokens with new architecture if available
        if (this.currentTokens.length > 0) {
            if (this.comparison) {
                this.comparison.processTokens(this.currentTokens);
            }
        }
    }
    
    updateComparisonLabels() {
        const archNames = {
            gqa: 'Grouped Query Attention',
            mqa: 'Multi-Query Attention',
            mha: 'Multi-Head Attention'
        };
        
        const titleElement = document.getElementById('comparison-title');
        const badgeElement = document.getElementById('comparison-badge');
        
        if (titleElement) {
            titleElement.textContent = archNames[this.comparisonArch] || this.comparisonArch.toUpperCase();
        }
        
        if (badgeElement) {
            badgeElement.textContent = 'Traditional';
        }
    }
    
    tokenize(text) {
        return text.split(/\s+/).filter(word => word.length > 0).map((word, idx) => ({
            text: word,
            id: idx,
            embedding: this.generateRandomEmbedding(),
            position: idx
        }));
    }
    
    generateRandomEmbedding() {
        return Array.from({length: 128}, () => Math.random() * 2 - 1);
    }
    
    updateCompressionUI() {
        const compressionValue = document.getElementById('compression-value');
        const compressionDisplay = document.getElementById('compression-ratio-display');
        
        if (compressionValue) {
            compressionValue.textContent = `${this.compressionRatio}x`;
        }
        if (compressionDisplay) {
            compressionDisplay.textContent = `${this.compressionRatio}x`;
        }
    }
    
    updateSpeedUI() {
        // Find the speed slider specifically
        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) {
            const speedLabel = speedSlider.closest('.param-group').querySelector('.param-value');
            if (speedLabel) {
                speedLabel.textContent = `${this.animationSpeed.toFixed(1)}x`;
            }
        }
    }
    updateAnimationSpeed() {
        // Update animation timing in visualizers if they support it
        if (this.mla.setAnimationSpeed) {
            this.mla.setAnimationSpeed(this.animationSpeed);
        }
        if (this.moe.setAnimationSpeed) {
            this.moe.setAnimationSpeed(this.animationSpeed);
        }
        if (this.comparison && this.comparison.setAnimationSpeed) {
            this.comparison.setAnimationSpeed(this.animationSpeed);
        }
    }
    
    updateMetrics() {
        this.updateMemoryMetrics();
        this.updateParameterMetrics();
        this.updateExpertMetrics();
    }
    
    updateMemoryMetrics() {
        const memoryBefore = this.calculateMemoryUsage(false);
        const memoryAfter = this.calculateMemoryUsage(true);
        const savingsPercent = ((memoryBefore - memoryAfter) / memoryBefore * 100).toFixed(1);
        
        const memoryUsageElement = document.getElementById('memory-usage');
        if (memoryUsageElement) {
            memoryUsageElement.textContent = `${memoryAfter.toFixed(1)}MB / ${memoryBefore.toFixed(1)}MB`;
        }
        
        // Update efficiency display
        const efficiencyElements = document.querySelectorAll('.metric-trend.up');
        efficiencyElements.forEach(el => {
            if (el.textContent.includes('%')) {
                el.textContent = `↑ ${savingsPercent}%`;
            }
        });
    }
    
    updateParameterMetrics() {
        const activeParamsElement = document.getElementById('active-params');
        if (activeParamsElement) {
            activeParamsElement.textContent = '37B / 671B';
        }
    }
    
    updateExpertMetrics() {
        const selectedExpertsElement = document.getElementById('selected-experts');
        if (selectedExpertsElement) {
            selectedExpertsElement.textContent = '9 Total';
        }
    }
    
    calculateMemoryUsage(compressed) {
        const seqLength = this.currentTokens.length || 1;
        const hiddenSize = 4096;
        const numHeads = 32;
        
        if (compressed) {
            const compressedSize = hiddenSize / this.compressionRatio;
            return (seqLength * compressedSize * 2 * 4) / (1024 * 1024); // 2 for K,V, 4 bytes per float
        } else {
            return (seqLength * hiddenSize * numHeads * 2 * 4) / (1024 * 1024);
        }
    }
    
    setProcessingState(processing) {
        this.isProcessing = processing;
        
        const processBtn = document.getElementById('process-btn');
        const mlaIndicator = document.getElementById('mla-indicator');
        const moeIndicator = document.getElementById('moe-indicator');
        const comparisonIndicator = document.getElementById('comparison-indicator');
        
        if (processing) {
            processBtn.textContent = 'Processing...';
            processBtn.disabled = true;
            if (mlaIndicator) mlaIndicator.style.display = 'flex';
            if (moeIndicator) moeIndicator.style.display = 'flex';
            if (comparisonIndicator) comparisonIndicator.style.display = 'flex';
        } else {
            processBtn.innerHTML = `
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg>
                Process
            `;
            processBtn.disabled = false;
            
            // Hide indicators after delay
            setTimeout(() => {
                if (mlaIndicator) mlaIndicator.style.display = 'none';
                if (moeIndicator) moeIndicator.style.display = 'none';
                if (comparisonIndicator) comparisonIndicator.style.display = 'none';
            }, 2000);
        }
    }
    
    updateProcessingIndicators() {
        const mlaIndicator = document.getElementById('mla-indicator');
        const moeIndicator = document.getElementById('moe-indicator');
        const comparisonIndicator = document.getElementById('comparison-indicator');
        
        if (mlaIndicator) {
            mlaIndicator.querySelector('span').textContent = `Processing ${this.currentTokens.length} tokens...`;
        }
        if (moeIndicator) {
            moeIndicator.querySelector('span').textContent = `Routing through experts...`;
        }
        if (comparisonIndicator) {
            comparisonIndicator.querySelector('span').textContent = `Processing with ${this.comparisonArch.toUpperCase()}...`;
        }
    }
    
    toggleMLADetails(show) {
        if (this.mla.setShowDetails) {
            this.mla.setShowDetails(show);
        }
    }
    
    toggleMoEDetails(show) {
        if (this.moe.setShowConnections) {
            this.moe.setShowConnections(show);
        }
    }
    
    toggleComparisonDetails(show) {
        if (this.comparison && this.comparison.setShowDetails) {
            this.comparison.setShowDetails(show);
        }
    }
    
    resetDemo() {
        // Reset to initial state
        document.getElementById('token-input').value = 'The quick brown fox jumps over the lazy dog';
        document.getElementById('compression-slider').value = '4';
        document.getElementById('expert-count').value = '32';
        
        const comparisonArchSelect = document.getElementById('comparison-arch');
        if (comparisonArchSelect) {
            comparisonArchSelect.value = 'gqa';
        }
        
        this.compressionRatio = 4;
        this.expertCount = 32;
        this.animationSpeed = 1.0;
        this.comparisonArch = 'gqa';
        
        this.updateCompressionUI();
        this.updateSpeedUI();
        this.updateComparisonArchitecture();
        
        // Reset visualizers
        if (this.mla.reset) this.mla.reset();
        if (this.moe.reset) this.moe.reset();
        if (this.comparison && this.comparison.reset) this.comparison.reset();
        
        this.showNotification('Demo reset to initial state', 'success');
    }
    
    exportVisualization() {
        try {
            // Create a combined canvas for export
            const exportCanvas = document.createElement('canvas');
            const exportCtx = exportCanvas.getContext('2d');
            
            exportCanvas.width = Math.max(this.mlaCanvas.width, this.comparisonCanvas?.width || 0);
            exportCanvas.height = this.mlaCanvas.height + (this.comparisonCanvas?.height || 0) + this.moeCanvas.height + 150;
            
            // Draw visualizations
            exportCtx.fillStyle = '#0f0f0f';
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
            
            let yOffset = 0;
            
            // Draw comparison section if available
            if (this.comparisonCanvas) {
                exportCtx.drawImage(this.mlaCanvas, 0, yOffset);
                exportCtx.drawImage(this.comparisonCanvas, this.mlaCanvas.width + 50, yOffset);
                yOffset += Math.max(this.mlaCanvas.height, this.comparisonCanvas.height) + 50;
            } else {
                exportCtx.drawImage(this.mlaCanvas, 0, yOffset);
                yOffset += this.mlaCanvas.height + 50;
            }
            
            exportCtx.drawImage(this.moeCanvas, 0, yOffset);
            
            // Download as PNG
            const link = document.createElement('a');
            link.download = `deepseek-architecture-comparison-${Date.now()}.png`;
            link.href = exportCanvas.toDataURL();
            link.click();
            
            this.showNotification('Visualization exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Export failed', 'error');
        }
    }
    
    refreshVisualizations() {
        if (this.currentTokens.length > 0) {
            this.mla.processTokens(this.currentTokens);
            this.moe.processTokens(this.currentTokens);
            if (this.comparison) {
                this.comparison.processTokens(this.currentTokens);
            }
            this.analytics.updateCharts();
        }
    }
    
    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            background: ${type === 'error' ? '#FF6B6B' : type === 'warning' ? '#FFE66D' : '#4ECDC4'};
            color: ${type === 'warning' ? '#000' : '#fff'};
            border-radius: 8px;
            z-index: 1000;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready, initializing DeepSeek demo');
    new DeepSeekDemo();
});

// Initialize view toggle functionality
function initViewToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const teamsContainer = document.getElementById('teamsList');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            toggleBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            if (view === 'list') {
                teamsContainer.classList.add('list-view');
                teamsContainer.classList.remove('grid-view');
            } else {
                teamsContainer.classList.add('grid-view');
                teamsContainer.classList.remove('list-view');
            }
        });
    });
}
