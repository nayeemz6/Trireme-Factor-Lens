"use client"

import { useEffect, useState } from "react"
import Plot from "react-plotly.js"
import type { Data, Layout } from "plotly.js"
import { getCorrelation } from "../../lib/api-client"

interface CorrelationHeatmapProps {
  isDarkMode?: boolean
}

export function CorrelationHeatmap({ isDarkMode = false }: CorrelationHeatmapProps) {
  const [correlationMatrix, setCorrelationMatrix] = useState<number[][]>([])
  const [factorNames, setFactorNames] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const correlationData = await getCorrelation()

      if (!correlationData.factors || correlationData.factors.length === 0) {
        setError("No data available")
        return
      }

      setFactorNames(correlationData.factors)
      setCorrelationMatrix(correlationData.correlation_matrix)

      setIsLoading(false)
    } catch (err) {
      console.error("Error loading correlation data:", err)
      setError("Failed to load data from API. Please check your connection.")
      setIsLoading(false)
    }
  }

  const plotData: Partial<Data>[] = [
    {
      z: correlationMatrix,
      x: factorNames,
      y: factorNames,
      type: "heatmap",
      colorscale: [
        [0, "#dc2626"],
        [0.5, "#f3f4f6"],
        [1, "#10b981"],
      ],
      zmin: -1,
      zmax: 1,
      text: correlationMatrix.map((row) => row.map((val) => val.toFixed(2))) as any,
      texttemplate: "%{text}",
      textfont: { size: 10 },
      hovertemplate: "%{y} vs %{x}<br>Correlation: %{z:.3f}<extra></extra>",
      colorbar: {
        title: { text: "Correlation" },
        tickmode: "linear",
        tick0: -1,
        dtick: 0.3,
      },
    },
  ]

  const layout: Partial<Layout> = {
    autosize: true,
    height: 400,
    margin: { l: 120, r: 80, t: 20, b: 80 },
    paper_bgcolor: isDarkMode ? "rgba(24, 26, 32, 0)" : "rgba(255, 255, 255, 0)",
    plot_bgcolor: isDarkMode ? "rgba(24, 26, 32, 0)" : "rgba(255, 255, 255, 0)",
    font: {
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
      size: 11,
    },
    xaxis: { side: "bottom", tickangle: -45, showgrid: false },
    yaxis: { showgrid: false },
  }

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["lasso2d", "select2d", "zoom2d", "pan2d"],
  }

  if (isLoading)
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )

  if (error)
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )

  return (
    <div className="w-full">
      <Plot data={plotData} layout={layout} config={config} style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
