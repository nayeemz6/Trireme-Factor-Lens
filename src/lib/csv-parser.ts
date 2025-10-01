import * as Papa from "papaparse"
import type { ParseResult } from "papaparse"

export interface ParsedCSVData {
  headers: string[]
  data: Record<string, any>[]
}

export async function parseCSV(filePath: string): Promise<ParsedCSVData> {
  try {
    const response = await fetch(filePath)
    const csvText = await response.text()

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<Record<string, any>>) => {
          resolve({
            headers: results.meta.fields || [],
            data: results.data as Record<string, any>[],
          })
        },
        error: (error: Error) => {
          reject(error)
        },
      })
    })
  } catch (error) {
    console.error("Error parsing CSV:", error)
    throw error
  }
}
