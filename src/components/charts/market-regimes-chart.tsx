"use client"

import { useEffect, useState } from "react"
import Plot from "react-plotly.js"
import { getRegimes, rebuildRegimes } from "../../lib/api-client"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Search, RotateCcw } from "lucide-react"
import { Button } from "../ui/button"
import { generateRegimeColors } from "../../lib/regime-colors"

interface MarketRegimesChartProps {
  isDarkMode?: boolean
  onRegimeDataChange?: (data: any[], k: number) => void
}

export function MarketRegimesChart({ isDarkMode = false, onRegimeDataChange }: MarketRegimesChartProps) {
  const [data, setData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [k, setK] = useState(2)
  const [mode, setMode] = useState<"exact" | "smooth">("exact")
  const [isLoading, setIsLoading] = useState(true)
  const [isRebuilding, setIsRebuilding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBTC, setShowBTC] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [originalStartDate, setOriginalStartDate] = useState("")
  const [originalEndDate, setOriginalEndDate] = useState("")

  const loadData = async (kValue?: number) => {
    const targetK = kValue ?? k
    try {
      setIsLoading(true)
      const apiData = await getRegimes(targetK)

      if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
        setError("No data available from API")
        setIsLoading(false)
        return
      }

      setData(apiData)
      setFilteredData(apiData)
      if (apiData.length > 0) {
        const firstDate = apiData[0].date
        const lastDate = apiData[apiData.length - 1].date
        setStartDate("")
        setEndDate("")
        setOriginalStartDate(firstDate)
        setOriginalEndDate(lastDate)
      }
      setIsLoading(false)
    } catch (err) {
      console.error(`Error loading regimes for k=${targetK}:`, err)
      setError("Failed to load regime data from API.")
      setIsLoading(false)
    }
  }

  const handleKChange = async (newK: number) => {
    setIsRebuilding(true)
    setError(null)
    try {
      await rebuildRegimes(newK)
      setK(newK)
      await loadData(newK)
    } catch (err) {
      console.error("Error rebuilding regimes:", err)
      setError("Failed to rebuild regimes. Please try again.")
    } finally {
      setIsRebuilding(false)
    }
  }

  const applyDateFilter = () => {
    if (!data.length) return

    let filtered = data
    if (startDate) {
      filtered = filtered.filter((row) => row.date >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter((row) => row.date <= endDate)
    }
    setFilteredData(filtered)
  }

  const resetDateFilter = () => {
    setStartDate(originalStartDate)
    setEndDate(originalEndDate)
    setFilteredData(data)
  }

  useEffect(() => {
    loadData()
  }, [mode])

  useEffect(() => {
    if (data.length > 0 && onRegimeDataChange) {
      onRegimeDataChange(filteredData, k)
    }
  }, [filteredData, k, onRegimeDataChange])

  const labelColumn = mode === "exact" ? "Regime_Label" : "Mean_Rolling_Label"

  const regimeColors = generateRegimeColors(k)

  const btcTrace = {
    x: filteredData.map((row) => row.date),
    y: filteredData.map((row) => row.BTC_Price ?? row.BTC),
    type: "scatter" as const,
    mode: "lines" as const,
    name: "BTC Price",
    line: { color: isDarkMode ? "#60a5fa" : "#2563eb", width: 2 },
    yaxis: "y",
  }

  const shapes: any[] = []
  if (filteredData.length > 0) {
    let currentRegime = filteredData[0][labelColumn]
    let startIdx = 0

    for (let i = 1; i <= filteredData.length; i++) {
      const isLastElement = i === filteredData.length
      const regimeChanged = !isLastElement && filteredData[i][labelColumn] !== currentRegime

      if (regimeChanged || isLastElement) {
        const x1Date = isLastElement ? filteredData[i - 1].date : filteredData[i].date

        shapes.push({
          type: "rect",
          xref: "x",
          yref: "paper",
          x0: filteredData[startIdx].date,
          x1: x1Date,
          y0: 0,
          y1: 1,
          fillcolor: regimeColors[currentRegime % k],
          opacity: 0.3,
          line: { width: 0 },
          layer: "below",
        })

        if (!isLastElement) {
          currentRegime = filteredData[i][labelColumn]
          startIdx = i
        }
      }
    }
  }

  const plotData = showBTC
    ? [btcTrace]
    : [
        {
          x: filteredData.map((row) => row.date),
          y: filteredData.map((row) => row.BTC_Price ?? row.BTC),
          type: "scatter" as const,
          mode: "lines" as const,
          name: "BTC Price",
          line: { color: "transparent", width: 0 },
          yaxis: "y",
          showlegend: false,
          hoverinfo: "skip" as const,
        },
      ]

  const layout = {
    autosize: true,
    height: 400,
    margin: { l: 60, r: 20, t: 20, b: 60 },
    paper_bgcolor: isDarkMode ? "rgba(24, 26, 32, 0)" : "rgba(255, 255, 255, 0)",
    plot_bgcolor: isDarkMode ? "rgba(24, 26, 32, 0)" : "rgba(255, 255, 255, 0)",
    font: { color: isDarkMode ? "#e5e7eb" : "#1f2937", size: 12 },
    xaxis: {
      gridcolor: isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.5)",
      showgrid: true,
      zeroline: false,
      rangeslider: { visible: true },
    },
    yaxis: {
      title: "BTC Price (Log Scale)",
      type: "log" as const,
      gridcolor: isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.5)",
      showgrid: true,
      zeroline: false,
    },
    shapes,
    hovermode: "x unified" as const,
    showlegend: true,
    legend: { orientation: "h" as const, y: -0.2, x: 0, xanchor: "left" as const },
  }

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["lasso2d", "select2d"],
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 sm:gap-6 p-3 sm:p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2 w-full sm:w-auto">
          <Label className="font-semibold">Number of Regimes (K)</Label>
          <div className="flex items-center gap-2">
            <Select
              value={k.toString()}
              onValueChange={(value) => handleKChange(Number.parseInt(value))}
              disabled={isRebuilding}
            >
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6].map((val) => (
                  <SelectItem key={val} value={val.toString()}>
                    K = {val}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isRebuilding && <span className="text-sm text-gray-500">Rebuilding...</span>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Regime Mode</Label>
          <RadioGroup value={mode} onValueChange={(value) => setMode(value as "exact" | "smooth")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="exact" id="exact" />
              <Label htmlFor="exact" className="cursor-pointer font-normal">
                Exact
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="smooth" id="smooth" />
              <Label htmlFor="smooth" className="cursor-pointer font-normal">
                Smooth
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Display Options</Label>
          <div className="flex items-center space-x-2">
            <Checkbox id="show-btc" checked={showBTC} onCheckedChange={(checked) => setShowBTC(checked as boolean)} />
            <Label htmlFor="show-btc" className="cursor-pointer font-normal">
              Show BTC Price
            </Label>
          </div>
        </div>

        <div className="space-y-2 w-full sm:w-auto">
          <Label>Date Range</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-[150px]"
              placeholder="dd/mm/yy"
              min="2022-01-01"
              max="2025-12-31"
            />
            <span className="text-sm text-muted-foreground hidden sm:inline">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-[150px]"
              placeholder="dd/mm/yy"
              min="2022-01-01"
              max="2025-12-31"
            />
            <div className="flex gap-2">
              <Button onClick={applyDateFilter} size="icon" variant="default">
                <Search className="h-4 w-4" />
              </Button>
              <Button onClick={resetDateFilter} size="icon" variant="outline" title="Reset date range">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <Plot data={plotData} layout={layout} config={config} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  )
}
