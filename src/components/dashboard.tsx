"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { FactorsVsBTCChart } from "./charts/factors-vs-btc-chart"
import { CorrelationHeatmap } from "./charts/correlation-heatmap"
import { MarketRegimesChart } from "./charts/market-regimes-chart"
import { RegimeProbabilitiesChart } from "./charts/regime-probabilities-chart"

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [regimeData, setRegimeData] = useState<any[]>([])
  const [regimeK, setRegimeK] = useState(3)

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"))
    }

    checkDarkMode()

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  const handleRegimeDataChange = (data: any[], k: number) => {
    setRegimeData(data)
    setRegimeK(k)
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Factor vs BTC Price</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Compare individual factor values against BTC price movement
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] sm:min-h-[500px]">
          <FactorsVsBTCChart isDarkMode={isDarkMode} />
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Factor Correlation Heatmap</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Correlation between factors
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] sm:min-h-[500px]">
          <CorrelationHeatmap isDarkMode={isDarkMode} />
        </CardContent>
      </Card>

      {/* Market Regimes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Market Regimes (GMM)</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Gaussian Mixture Model regime classification with BTC price overlay
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[500px] sm:min-h-[600px]">
          <MarketRegimesChart isDarkMode={isDarkMode} onRegimeDataChange={handleRegimeDataChange} />
        </CardContent>
      </Card>

      {/* Market Regime Probabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Market Regime Probabilities</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Stacked probability distribution across regimes over time
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[600px] sm:min-h-[800px]">
          <RegimeProbabilitiesChart data={regimeData} k={regimeK} isDarkMode={isDarkMode} />
        </CardContent>
      </Card>
    </div>
  )
}
