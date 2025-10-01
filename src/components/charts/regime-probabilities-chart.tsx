import Plot from "react-plotly.js"

interface RegimeProbabilitiesChartProps {
  data: any[]
  k: number
  isDarkMode?: boolean
}

export function RegimeProbabilitiesChart({ data, k, isDarkMode = false }: RegimeProbabilitiesChartProps) {
  const regimeColors = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"]

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        No regime data available. Please select a regime configuration above.
      </div>
    )
  }

  // Create traces for each regime
  const traces = []
  for (let i = 0; i < k; i++) {
    const regimeKey = `regime_${i}`
    traces.push({
      x: data.map((row) => row.date || row.Date),
      y: data.map((row) => row[regimeKey] || 0),
      type: "bar" as const,
      name: `Regime ${i}`,
      marker: {
        color: regimeColors[i % regimeColors.length],
      },
      hovertemplate: `Regime ${i}<br>Probability: %{y:.2%}<extra></extra>`,
    })
  }

  const layout = {
    autosize: true,
    height: 400,
    margin: { l: 60, r: 20, t: 20, b: 40 },
    paper_bgcolor: isDarkMode ? "rgba(24, 26, 32, 0)" : "rgba(255, 255, 255, 0)",
    plot_bgcolor: isDarkMode ? "rgba(24, 26, 32, 0)" : "rgba(255, 255, 255, 0)",
    font: {
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
      size: 12,
    },
    barmode: "stack" as const,
    xaxis: {
      gridcolor: isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.5)",
      showgrid: false,
      zeroline: false,
    },
    yaxis: {
      title: "Probability",
      gridcolor: isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.5)",
      showgrid: true,
      zeroline: false,
      tickformat: ".0%",
      range: [0, 1],
    },
    hovermode: "x unified" as const,
    showlegend: true,
    legend: {
      orientation: "h" as const,
      y: -0.2,
      x: 0,
      xanchor: "left" as const,
    },
  }

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["lasso2d", "select2d"],
  }

  return (
    <div className="w-full">
      <Plot data={traces} layout={layout} config={config} style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
