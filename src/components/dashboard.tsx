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
    //dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"))
    }

    checkDarkMode()

    //theme changes
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
    <div className="space-y-6">
      {/* Top Row: Factors vs BTC and Correlation Heatmap */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Factors vs BTC</CardTitle>
            <CardDescription>Factor analysis with logarithmic BTC price</CardDescription>
          </CardHeader>
          <CardContent>
            <FactorsVsBTCChart isDarkMode={isDarkMode} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Factor Correlation Heatmap</CardTitle>
            <CardDescription>Correlation between factors</CardDescription>
          </CardHeader>
          <CardContent>
            <CorrelationHeatmap isDarkMode={isDarkMode} />
          </CardContent>
        </Card>
      </div>

      {/* Market Regimes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Market Regimes (GMM)</CardTitle>
          <CardDescription>Gaussian Mixture Model regime classification with BTC price overlay</CardDescription>
        </CardHeader>
        <CardContent>
          <MarketRegimesChart isDarkMode={isDarkMode} onRegimeDataChange={handleRegimeDataChange} />
        </CardContent>
      </Card>

      {/* Market Regime Probabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Market Regime Probabilities</CardTitle>
          <CardDescription>Probability distribution across regimes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <RegimeProbabilitiesChart data={regimeData} k={regimeK} isDarkMode={isDarkMode} />
        </CardContent>
      </Card>
    </div>
  )
}
