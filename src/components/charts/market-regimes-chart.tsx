"use client"

import { useEffect, useState } from "react"
import Plot from "react-plotly.js"
import { parseCSV } from "../../lib/csv-parser"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface MarketRegimesChartProps {
  isDarkMode?: boolean
  onRegimeDataChange?: (data: any[], k: number) => void
}

export function MarketRegimesChart({ isDarkMode = false, onRegimeDataChange }: MarketRegimesChartProps) {
  const [data, setData] = useState<any[]>([])
  const [k, setK] = useState(3)
  const [mode, setMode] = useState<"exact" | "relaxed">("exact")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [k])

  useEffect(() => {
    if (data.length > 0 && onRegimeDataChange) {
      onRegimeDataChange(data, k)
    }
  }, [data, k, onRegimeDataChange])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const csvData = await parseCSV(`/data/GMM_labels_k${k}.csv`)

      if (csvData.data.length === 0) {
        setError("No data available")
        return
      }

      setData(csvData.data)
      setIsLoading(false)
    } catch (err) {
      console.error(`Error loading GMM data for k=${k}:`, err)
      setError(`Failed to load data. Please ensure GMM_labels_k${k}.csv is in the /public/data folder.`)
      setIsLoading(false)
    }
  }

  const regimeColors = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"]

  const labelColumn = mode === "exact" ? "Regime Label" : "Mean Rolling Label"

  // Create BTC price line
  const btcTrace = {
    x: data.map((row) => row.date || row.Date),
    y: data.map((row) => row["BTC Price"] || row.BTC),
    type: "scatter" as const,
    mode: "lines" as const,
    name: "BTC Price",
    line: {
      color: isDarkMode ? "#60a5fa" : "#2563eb",
      width: 2,
    },
    yaxis: "y",
  }

  // Create regime background shapes
  const shapes: any[] = []
  let currentRegime = data[0]?.[labelColumn]
  let startIdx = 0

  for (let i = 1; i < data.length; i++) {
    if (data[i][labelColumn] !== currentRegime) {
      shapes.push({
        type: "rect",
        xref: "x",
        yref: "paper",
        x0: data[startIdx].date || data[startIdx].Date,
        x1: data[i - 1].date || data[i - 1].Date,
        y0: 0,
        y1: 1,
        fillcolor: regimeColors[currentRegime % regimeColors.length],
        opacity: 0.15,
        line: { width: 0 },
        layer: "below",
      })
      currentRegime = data[i][labelColumn]
      startIdx = i
    }
  }

  // Add final regime
  if (data.length > 0) {
    shapes.push({
      type: "rect",
      xref: "x",
      yref: "paper",
      x0: data[startIdx].date || data[startIdx].Date,
      x1: data[data.length - 1].date || data[data.length - 1].Date,
      y0: 0,
      y1: 1,
      fillcolor: regimeColors[currentRegime % regimeColors.length],
      opacity: 0.15,
      line: { width: 0 },
      layer: "below",
    })
  }

  const plotData = [btcTrace]

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
    xaxis: {
      gridcolor: isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.5)",
      showgrid: true,
      zeroline: false,
    },
    yaxis: {
      title: "BTC Price (Log Scale)",
      type: "log" as const,
      gridcolor: isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.5)",
      showgrid: true,
      zeroline: false,
    },
    shapes: shapes,
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
      <div className="flex flex-wrap gap-6 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2">
          <Label>Number of Regimes (K)</Label>
          <Select value={k.toString()} onValueChange={(value) => setK(Number.parseInt(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">K = 2</SelectItem>
              <SelectItem value="3">K = 3</SelectItem>
              <SelectItem value="4">K = 4</SelectItem>
              <SelectItem value="5">K = 5</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Regime Mode</Label>
          <RadioGroup value={mode} onValueChange={(value) => setMode(value as "exact" | "relaxed")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="exact" id="exact" />
              <Label htmlFor="exact" className="cursor-pointer font-normal">
                Exact
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="relaxed" id="relaxed" />
              <Label htmlFor="relaxed" className="cursor-pointer font-normal">
                Relaxed (Rolling Mean)
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="w-full">
        <Plot data={plotData} layout={layout} config={config} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  )
}
