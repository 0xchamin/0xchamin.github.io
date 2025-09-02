# DeepSeek V3/R1 Architecture Explorer

Interactive visualization of DeepSeek's Multi-Head Latent Attention (MLA) and Mixture of Experts (MoE) architecture, based on Sebastian Raschka's technical analysis.

![DeepSeek V3/R1 Architecture Explorer](deepseek.gif)

## Demo

🔗 **[Live Demo](https://0xchamin.github.io/deepseek/)**

## Overview

This web application provides an educational visualization of DeepSeek V3/R1's key architectural innovations:

- **Multi-Head Latent Attention (MLA)**: Demonstrates KV cache compression and memory efficiency
- **Mixture of Experts (MoE)**: Shows sparse activation with shared expert architecture
- **Comparative Analysis**: Side-by-side comparison with traditional attention mechanisms (MHA, MQA, GQA)

## Features

### Core Visualizations
- Real-time token processing animations
- Interactive MLA compression pipeline (4x KV cache reduction)
- MoE expert routing with 1 shared + 8 routed experts
- Architecture comparison charts and performance metrics

### Educational Components
- Dynamic explanations that adapt to current processing state
- Comparative memory usage analysis
- Real-time parameter efficiency calculations (37B/671B active)

### Interactive Controls
- Adjustable compression ratios (2x-8x)
- Architecture selection (MHA/MQA/GQA comparison)
- Animation speed control
- Expert count visualization (16-32 experts)

## Technical Implementation

### Architecture
```
DeepSeek Explorer/
├── index.html          # Main application entry
├── css/
│   └── styles.css      # UI styling and responsive design
└── js/
    ├── main.js         # Application controller and event handling
    ├── mla.js          # Multi-Head Latent Attention visualizer
    ├── moe.js          # Mixture of Experts visualizer
    ├── comparison.js   # Architecture comparison engine
    └── analytics.js    # Performance metrics and charts
```

### Key Technologies
- **Frontend**: Vanilla JavaScript, HTML5 Canvas, CSS Grid
- **Visualization**: Custom canvas-based rendering
- **Architecture**: Modular component design with event-driven updates

## Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- No additional dependencies required

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/deepseek-architecture-explorer.git
   cd deepseek-architecture-explorer
   ```

2. **Serve locally**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### GitHub Pages Deployment

1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (typically `main`)
4. Access at `https://yourusername.github.io/repository-name`

## Usage

### Basic Operation
1. Enter text in the input field
2. Click "Process" to see token flow through MLA → MoE pipeline
3. Adjust parameters using controls to explore different configurations
4. Switch between architecture comparisons using the dropdown

### Educational Mode
- Interactive explanations appear in real-time during processing
- Hover over components for detailed information
- Use comparative charts to understand efficiency gains

## Educational Background

This visualization is based on Sebastian Raschka's analysis in ["The Big LLM Architecture Comparison"](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison), focusing on:

- **MLA Innovation**: Why DeepSeek chose MLA over Grouped-Query Attention
- **MoE Efficiency**: How sparse activation achieves 94% parameter savings
- **Architectural Trade-offs**: Memory vs. performance optimization strategies

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Make changes and test locally
4. Commit with clear messages (`git commit -m 'Add: feature description'`)
5. Push to branch (`git push origin feature/improvement`)
6. Open a Pull Request

### Code Style
- Use ES6+ JavaScript features
- Maintain consistent indentation (2 spaces)
- Add comments for complex visualization logic
- Follow existing naming conventions

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance

- Optimized for 60fps animations
- Responsive design for desktop and tablet
- Efficient canvas rendering with requestAnimationFrame
- Memory-conscious token processing

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Sebastian Raschka for the comprehensive architectural analysis
- DeepSeek team for innovative MLA and MoE implementations
- Educational inspiration from Stanford CS courses

## References

- [DeepSeek V3 Technical Report](https://arxiv.org/abs/2412.19437)
- [Sebastian Raschka's Architecture Analysis](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison)
- [Multi-Head Latent Attention Paper](https://arxiv.org/abs/2405.04434)
