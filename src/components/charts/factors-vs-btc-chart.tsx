"use client"

import { useEffect, useState, useRef } from "react"
import Plot from "react-plotly.js"
import { parseCSV } from "../../lib/csv-parser"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"

interface FactorsVsBTCChartProps {
  isDarkMode?: boolean
}

export function FactorsVsBTCChart({ isDarkMode = false }: FactorsVsBTCChartProps) {
  const [data, setData] = useState<any[]>([])
  const [factors, setFactors] = useState<string[]>([])
  const [selectedFactors, setSelectedFactors] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const plotRef = useRef<any>(null)

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

      // Extract factor names (all columns except date)
      const factorNames = csvData.headers.filter((h) => h.toLowerCase() !== "date")
      setFactors(factorNames)

      // Select BTC and first 3 factors by default
      const btcFactor = factorNames.find((f) => f.toLowerCase().includes("btc"))
      const defaultSelected = new Set<string>()
      if (btcFactor) defaultSelected.add(btcFactor)
      factorNames.slice(0, 3).forEach((f) => defaultSelected.add(f))
      setSelectedFactors(defaultSelected)

      setData(csvData.data)
      setIsLoading(false)
    } catch (err) {
      console.error("Error loading factors data:", err)
      setError("Failed to load data. Please ensure factors_data.csv is in the /public/data folder.")
      setIsLoading(false)
    }
  }

  const toggleFactor = (factor: string) => {
    const newSelected = new Set(selectedFactors)
    if (newSelected.has(factor)) {
      newSelected.delete(factor)
    } else {
      newSelected.add(factor)
    }
    setSelectedFactors(newSelected)
  }

  const plotData = Array.from(selectedFactors).map((factor) => {
    const isBTC = factor.toLowerCase().includes("btc")
    return {
      x: data.map((row) => row.date || row.Date),
      y: data.map((row) => row[factor]),
      type: "scatter" as const,
      mode: "lines" as const,
      name: factor,
      line: {
        width: isBTC ? 2.5 : 1.5,
      },
      yaxis: isBTC ? "y" : "y2",
    }
  })

  const layout = {
    autosize: true,
    height: 400,
    margin: { l: 60, r: 60, t: 20, b: 40 },
    paper_bgcolor: isDarkMode ? "rgba(24, 26, 32, 0)" : "rgba(255, 255, 255, 0)",
    plot_bgcolor: isDarkMode ? "rgba(24, 26, 32, 0)" : "rgba(255, 255, 255, 0)",
    font: {
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
      size: 12,
    },
    xaxis: {
      gridcolor: isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.5)",
      showgrid: true,
      zeroline: false,
    },
    yaxis: {
      title: "BTC Price (USD, Log Scale)",
      type: "log" as const,
      gridcolor: isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.5)",
      showgrid: true,
      zeroline: false,
      side: "left" as const,
    },
    yaxis2: {
      title: "Factor Values (Normalized)",
      overlaying: "y" as const,
      side: "right" as const,
      gridcolor: "transparent",
      zeroline: false,
    },
    legend: {
      orientation: "h" as const,
      y: -0.2,
      x: 0,
      xanchor: "left" as const,
    },
    hovermode: "x unified" as const,
  }

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["lasso2d", "select2d"],
  }

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
        {factors.slice(0, 10).map((factor) => (
          <div key={factor} className="flex items-center space-x-2">
            <Checkbox
              id={`factor-${factor}`}
              checked={selectedFactors.has(factor)}
              onCheckedChange={() => toggleFactor(factor)}
            />
            <Label htmlFor={`factor-${factor}`} className="text-sm cursor-pointer">
              {factor}
            </Label>
          </div>
        ))}
      </div>
      <div className="w-full">
        <Plot ref={plotRef} data={plotData} layout={layout} config={config} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  )
}
