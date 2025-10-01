# Trireme Factor Lens
Factor analysis and market regime visualization.

## Features
- **Password Protection**: Secure access to the dashboard
- **Dark/Light Mode**
- **Interactive Charts**:
  - Factors vs BTC: Multi-select factor comparison with logarithmic BTC price scale
  - Correlation Heatmap: Correlation between all factors
  - Market Regimes: GMM-based regime classification with visual overlays
  - Regime Probabilities: Chart showing probability distributions
- **Responsive Design**: Optimized for desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Default Password

The default password is `trireme2024`. To change it, edit the `correctPassword` variable in `src/components/login-modal.tsx`.


## Technology Stack

- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS v4
- **Charts**: Plotly.js
- **Data Parsing**: PapaParse
- **UI Components**: Radix UI primitives

## Project Structure

\`\`\`
trireme-factor-lens/
├── public/
│   └── data/              # CSV data files
├── src/
│   ├── components/
│   │   ├── charts/        # Chart components
│   │   ├── ui/            # UI primitives
│   │   ├── dashboard.tsx
│   │   ├── login-modal.tsx
│   │   └── theme-toggle.tsx
│   ├── lib/
│   │   ├── csv-parser.ts  # CSV parsing utilities
│   │   └── utils.ts       # Helper functions
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── vite.config.ts
└── package.json
\`\`\`
