const API_BASE_URL = "https://factor-lens-1018759291561.us-central1.run.app"

export interface FactorData {
  date: string
  BTC: number
  [key: string]: number | string // Other factor columns
}

export interface CorrelationData {
  factors: string[]
  correlation_matrix: number[][]
}

export interface RegimeData {
  date: string
  BTC_Price: number
  Regime_Label: number
  Mean_Rolling_Label?: number // Made optional
  [key: string]: number | string | undefined // probability columns like regime_0, regime_1
}

export interface StatusResponse {
  status: string
  message?: string
}

/**
 * Fetch factors from backend
 */
export async function getFactors(timeframe = "1d"): Promise<FactorData[]> {
  try {
    const url = `${API_BASE_URL}/api/factors?timeframe=${timeframe}`

    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch factors: ${response.statusText}`)

    const raw = await response.json()
    console.log("[v1] Raw factors API:", raw)

    // Normalize object API response to array of FactorData
    if (Array.isArray(raw)) return raw as FactorData[]
    if (!raw || !raw.dates || !raw.columns || !raw.data) return []

    const { dates, columns, data } = raw
    const factors: FactorData[] = dates.map((date: string, i: number) => {
      const row: FactorData = { date, BTC: 0 }
      columns.forEach((col: string, j: number) => {
        const val = data[i][j]
        row[col] = typeof val === "number" ? val : Number(val)
      })
      return row
    })

    return factors
  } catch (err) {
    console.error("[v1] Error fetching factors:", err)
    throw err
  }
}

/**
 * Fetch correlation matrix
 */
export async function getCorrelation(): Promise<CorrelationData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/correlation`)
    if (!response.ok) throw new Error(`Failed to fetch correlation: ${response.statusText}`)
    return await response.json()
  } catch (err) {
    console.error("[v1] Error fetching correlation:", err)
    throw err
  }
}

/**
 * Fetch regime data for a specific k
 */
export async function getRegimes(k: number): Promise<RegimeData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/regimes/${k}`)
    if (!response.ok) throw new Error(`Failed to fetch regimes: ${response.statusText}`)

    const raw = await response.json()
    console.log(`[v1] Raw regimes API for k=${k}:`, raw)

    if (Array.isArray(raw)) return raw as RegimeData[]
    if (!raw || !raw.dates || !raw.btc_price || !raw.regime_labels) return []

    const { dates, btc_price, regime_labels, relaxed_labels, regime_probabilities } = raw

    const regimes: RegimeData[] = dates.map((date: string, i: number) => {
      const entry: RegimeData = {
        date,
        BTC_Price: btc_price[i],
        Regime_Label: regime_labels[i],
        Mean_Rolling_Label: relaxed_labels ? relaxed_labels[i] : undefined,
      }

      if (regime_probabilities && typeof regime_probabilities === "object") {
        for (const key of Object.keys(regime_probabilities)) {
          const arr = regime_probabilities[key]
          if (Array.isArray(arr)) entry[key] = arr[i]
        }
      }

      return entry
    })

    return regimes
  } catch (err) {
    console.error(`[v1] Error fetching regimes for k=${k}:`, err)
    throw err
  }
}

/**
 * Rebuild regimes for k
 */
export async function rebuildRegimes(k: number): Promise<StatusResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/regimes/rebuild/${k}`)
    if (!response.ok) throw new Error(`Failed to rebuild regimes: ${response.statusText}`)
    return await response.json()
  } catch (err) {
    console.error("[v1] Error rebuilding regimes:", err)
    throw err
  }
}

/**
 * Fetch available factors
 */
export async function getAvailableFactors(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/available-factors`)
    if (!response.ok) throw new Error(`Failed to fetch available factors: ${response.statusText}`)
    return await response.json()
  } catch (err) {
    console.error("[v1] Error fetching available factors:", err)
    throw err
  }
}

/**
 * Fetch API status
 */
export async function getStatus(): Promise<StatusResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status`)
    if (!response.ok) throw new Error(`Failed to fetch status: ${response.statusText}`)
    return await response.json()
  } catch (err) {
    console.error("[v1] Error fetching status:", err)
    throw err
  }
}

/**
 * Clear API cache
 */
export async function clearCache(): Promise<StatusResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cache/clear`, { method: "DELETE" })
    if (!response.ok) throw new Error(`Failed to clear cache: ${response.statusText}`)
    return await response.json()
  } catch (err) {
    console.error("[v1] Error clearing cache:", err)
    throw err
  }
}
