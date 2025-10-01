"use client"

import { useEffect, useState } from "react"
import Plot from "react-plotly.js"
import type { Data, Layout } from "plotly.js"
import { parseCSV } from "../../lib/csv-parser"

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
      const csvData = await parseCSV("/data/factors_data.csv")

      if (csvData.data.length === 0) {
        setError("No data available")
        return
      }

      const factors = csvData.headers.filter((h) => h.toLowerCase() !== "date")
      setFactorNames(factors)

      const matrix = calculateCorrelationMatrix(csvData.data, factors)
      setCorrelationMatrix(matrix)

      setIsLoading(false)
    } catch (err) {
      console.error("Error loading correlation data:", err)
      setError("Failed to load data. Please ensure factors_data.csv is in the /public/data folder.")
      setIsLoading(false)
    }
  }

  const calculateCorrelationMatrix = (data: any[], factors: string[]): number[][] => {
    const n = factors.length
    const matrix: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0))

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1
        } else {
          const values1 = data.map((row) => row[factors[i]]).filter((v) => v !== null && !isNaN(v))
          const values2 = data.map((row) => row[factors[j]]).filter((v) => v !== null && !isNaN(v))
          matrix[i][j] = pearsonCorrelation(values1, values2)
        }
      }
    }

    return matrix
  }

  const pearsonCorrelation = (x: number[], y: number[]): number => {
    const n = Math.min(x.length, y.length)
    if (n === 0) return 0

    const meanX = x.reduce((a, b) => a + b, 0) / n
    const meanY = y.reduce((a, b) => a + b, 0) / n

    let numerator = 0
    let denomX = 0
    let denomY = 0

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX
      const dy = y[i] - meanY
      numerator += dx * dy
      denomX += dx * dx
      denomY += dy * dy
    }

    if (denomX === 0 || denomY === 0) return 0
    return numerator / Math.sqrt(denomX * denomY)
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
