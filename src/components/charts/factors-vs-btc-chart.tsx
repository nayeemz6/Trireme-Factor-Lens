"use client"

import { useEffect, useState, useRef } from "react"
import Plot from "react-plotly.js"
import { getFactors } from "../../lib/api-client"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Search } from "lucide-react"

interface FactorsVsBTCChartProps {
  isDarkMode?: boolean
}

const TIMEFRAMES = [
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
]

export function FactorsVsBTCChart({ isDarkMode = false }: FactorsVsBTCChartProps) {
  const [data, setData] = useState<any[]>([])
  const [fullData, setFullData] = useState<any[]>([])
  const [factors, setFactors] = useState<string[]>([])
  const [selectedFactors, setSelectedFactors] = useState<Set<string>>(new Set())
  const [showBTC, setShowBTC] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState("1m")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [manualDateOverride, setManualDateOverride] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const plotRef = useRef<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!manualDateOverride) {
      applyTimeframeFilter()
    }
  }, [selectedTimeframe, fullData])

  useEffect(() => {
    if (manualDateOverride) {
      filterDataByDates()
    }
  }, [startDate, endDate, fullData, manualDateOverride])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const apiData = await getFactors("all")

      if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
        setError("No data available from API")
        setIsLoading(false)
        return
      }

      const factorNames = Object.keys(apiData[0]).filter(
        (key) => key.toLowerCase() !== "date" && !key.toLowerCase().includes("btc_price"),
      )
      setFactors(factorNames)

      const defaultSelected = new Set<string>()
      factorNames.slice(0, 3).forEach((f) => defaultSelected.add(f))
      setSelectedFactors(defaultSelected)

      setFullData(apiData)
      setIsLoading(false)
    } catch (err) {
      console.error("Error loading factors data:", err)
      setError("Failed to load data from API. Please check your connection.")
      setIsLoading(false)
    }
  }

  const applyTimeframeFilter = () => {
    if (!fullData || fullData.length === 0) return

    if (selectedTimeframe === "all") {
      setData(fullData)
      return
    }

    const now = new Date()
    let daysToSubtract = 0

    switch (selectedTimeframe) {
      case "1m":
        daysToSubtract = 30
        break
      case "3m":
        daysToSubtract = 90
        break
      case "6m":
        daysToSubtract = 180
        break
      case "1y":
        daysToSubtract = 365
        break
    }

    const cutoffDate = new Date(now)
    cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract)
    const cutoffDateStr = cutoffDate.toISOString().split("T")[0]

    const filtered = fullData.filter((row) => {
      const rowDate = row.date || row.Date
      return rowDate >= cutoffDateStr
    })

    setData(filtered)
    console.log(
      "[v0] Timeframe filtered data:",
      filtered.length,
      "records from",
      filtered[0]?.date,
      "to",
      filtered[filtered.length - 1]?.date,
    )
  }

  const filterDataByDates = () => {
    if (!fullData || fullData.length === 0) return

    let filtered = [...fullData]

    if (startDate) {
      filtered = filtered.filter((row) => {
        const rowDate = row.date || row.Date
        return rowDate >= startDate
      })
    }

    if (endDate) {
      filtered = filtered.filter((row) => {
        const rowDate = row.date || row.Date
        return rowDate <= endDate
      })
    }

    setData(filtered)
    console.log(
      "[v0] Date filtered data:",
      filtered.length,
      "records from",
      filtered[0]?.date,
      "to",
      filtered[filtered.length - 1]?.date,
    )
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

  const cumulativeReturns = (arr: number[]) => {
    let cum = 1
    return arr.map((val) => {
      cum *= 1 + (val ?? 0)
      return cum
    })
  }

  const applyDateFilter = () => {
    setManualDateOverride(true)
    filterDataByDates()
  }

  const handleTimeframeChange = (value: string) => {
    setSelectedTimeframe(value)
    setManualDateOverride(false)
    setStartDate("")
    setEndDate("")
  }

  const plotData = Array.from(selectedFactors).map((factor) => ({
    x: data.map((row) => row.date || row.Date),
    y: cumulativeReturns(data.map((row) => row[factor])),
    type: "scatter" as const,
    mode: "lines" as const,
    name: factor,
    line: { width: 2 },
  }))

  if (showBTC && data.length > 0) {
    const btcKey = Object.keys(data[0]).find((key) => key.toLowerCase().includes("btc_price"))
    if (btcKey) {
      const btcValues = data.map((row) => row[btcKey])
      const btcNorm = btcValues.map((v) => v / btcValues[0])
      plotData.push({
        x: data.map((row) => row.date || row.Date),
        y: btcNorm,
        type: "scatter" as const,
        mode: "lines" as const,
        name: "BTC",
      line: { color: "#9ca3af", dash: "dot", width: 2 } as any,

      })
    }
  }

  const layout = {
    autosize: true,
    height: 600,
    margin: { l: 60, r: 60, t: 40, b: 40 },
    title: "Factor vs BTC",
    paper_bgcolor: isDarkMode ? "rgba(24, 26, 32, 0)" : "rgba(255, 255, 255, 0)",
    plot_bgcolor: isDarkMode ? "rgba(24, 26, 32, 0)" : "rgba(255, 255, 255, 0)",
    font: { color: isDarkMode ? "#e5e7eb" : "#1f2937", size: 12 },
    xaxis: {
      title: "Date",
      gridcolor: isDarkMode ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.5)",
      showgrid: true,
      zeroline: false,
      rangeslider: { visible: true },
    },
    yaxis: {
      title: "Cumulative Sum",
      side: "left" as const,
      showgrid: true,
      zeroline: false,
    },
    legend: { orientation: "h" as const, y: -0.2, x: 0, xanchor: "left" as const },
    hovermode: "x unified" as const,
  }

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["lasso2d", "select2d"],
  }

  if (isLoading) return <div className="h-[400px] flex items-center justify-center">Loading...</div>
  if (error) return <div className="h-[400px] flex items-center justify-center">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="start-date" className="text-sm whitespace-nowrap">
            Start Date:
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="end-date" className="text-sm whitespace-nowrap">
            End Date:
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={applyDateFilter} size="icon" variant="default">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={selectedTimeframe} onValueChange={handleTimeframeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {TIMEFRAMES.map((tf) => (
            <TabsTrigger key={tf.value} value={tf.value}>
              {tf.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox id="factor-btc" checked={showBTC} onCheckedChange={(checked) => setShowBTC(checked as boolean)} />
          <Label htmlFor="factor-btc" className="text-sm cursor-pointer font-semibold">
            BTC
          </Label>
        </div>
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
