import Plot from "react-plotly.js"
import type { Layout} from "plotly.js"

import { generateRegimeColors } from "../../lib/regime-colors"

interface RegimeProbabilitiesChartProps {
  data: any[]
  k: number
  isDarkMode?: boolean
}

export function RegimeProbabilitiesChart({
  data,
  k,
  isDarkMode = false,
}: RegimeProbabilitiesChartProps) {
  const regimeColors = generateRegimeColors(k)

  if (!data || data.length === 0) {
    return (
      <div className="h-[800px] flex items-center justify-center text-muted-foreground">
        No regime data available. Please select a regime configuration above.
      </div>
    )
  }

  const traces: Plotly.Data[] = []

  // Top panel: BTC Price
  const btcPriceData = data.map((row) => row.BTC_Price ?? row.BTC)

  traces.push({
    x: data.map((row) => row.date || row.Date),
    y: btcPriceData,
    type: "scatter" as const,
    mode: "lines" as const,
    name: "BTC",
    line: {
      color: isDarkMode ? "#9ca3af" : "#374151",
      width: 1.5,
    },
    xaxis: "x",
    yaxis: "y",
    hovertemplate: "BTC: $%{y:,.0f}<extra></extra>",
  })

  for (let i = 0; i < k; i++) {
    const regimeKey = `regime_${i}`
    const yValues = data.map((row) => row[regimeKey] || 0)

    traces.push({
      x: data.map((row) => row.date || row.Date),
      y: yValues,
      type: "scatter" as const,
      mode: "lines" as const,
      name: `regime_${i}`,
      line: {
        width: 0,
        color: regimeColors[i],
      },
      fill: "tonexty" as const,
      fillcolor: regimeColors[i],
      stackgroup: "one",
      xaxis: "x2",
      yaxis: "y2",
      hovertemplate: `regime_${i}<br>Probability: %{y:.3f}<extra></extra>`,
    })
  }

  const layout: Partial<Layout> = {
    title: {
      text: "GMM Regime Probabilities",
      x: 0.02,
      y: 0.98,
      xanchor: "left" as const,
      yanchor: "top" as const,
      font: {
        size: 16,
        color: isDarkMode ? "#e5e7eb" : "#1f2937",
      },
    },
    autosize: true,
    height: 800,
    margin: { l: 60, r: 20, t: 60, b: 100 },
    paper_bgcolor: isDarkMode
      ? "rgba(24, 26, 32, 0)"
      : "rgba(255, 255, 255, 0)",
    plot_bgcolor: isDarkMode
      ? "rgba(24, 26, 32, 0)"
      : "rgba(255, 255, 255, 0)",
    font: {
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
      size: 12,
    },
    xaxis: {
      domain: [0, 1],
      anchor: "y",
      showgrid: false,
      zeroline: false,
      showticklabels: false,
    },
    yaxis: {
      domain: [0.42, 1],
      anchor: "x",
      title: "BTC Price",
      gridcolor: isDarkMode
        ? "rgba(75, 85, 99, 0.3)"
        : "rgba(209, 213, 219, 0.5)",
      showgrid: true,
      zeroline: false,
    },
    xaxis2: {
      domain: [0, 1],
      anchor: "y2",
      gridcolor: isDarkMode
        ? "rgba(75, 85, 99, 0.3)"
        : "rgba(209, 213, 219, 0.5)",
      showgrid: false,
      zeroline: false,
      rangeslider: { visible: true, thickness: 0.05 },
    },
    yaxis2: {
      domain: [0, 0.38],
      anchor: "x2",
      title: "",
      gridcolor: isDarkMode
        ? "rgba(75, 85, 99, 0.3)"
        : "rgba(209, 213, 219, 0.5)",
      showgrid: true,
      zeroline: false,
    },
    hovermode: "x unified" as const,
    showlegend: true,
    legend: {
      orientation: "h" as const,
      y: 0.98,
      x: 0.98,
      xanchor: "right" as const,
      yanchor: "top" as const,
      bgcolor: isDarkMode
        ? "rgba(24, 26, 32, 0.8)"
        : "rgba(255, 255, 255, 0.8)",
    },
    annotations: [
      {
        text: "",
        xref: "paper",
        yref: "paper",
        x: 0.98,
        y: 0.72,
        xanchor: "center" as const,
        yanchor: "top" as const,
        showarrow: false,
        font: {
          size: 14,
          color: isDarkMode ? "#e5e7eb" : "#1f2937",
        },
      },
      {
        text: "Regime Probabilities",
        xref: "paper",
        yref: "paper",
        x: 0.5,
        y: 0.4,
        xanchor: "center" as const,
        yanchor: "bottom" as const,
        showarrow: false,
        font: {
          size: 14,
          color: isDarkMode ? "#e5e7eb" : "#1f2937",
        },
      },
    ],
  }

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["lasso2d", "select2d"],
  }

  return (
    <div className="w-full h-full">
      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}

export default RegimeProbabilitiesChart
