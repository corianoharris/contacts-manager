"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TestAirtablePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [envVars, setEnvVars] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true)

        // Test environment variables
        const envResponse = await fetch("/api/test-env")
        const envData = await envResponse.json()
        setEnvVars(envData)

        // Test Airtable connection
        const response = await fetch("/api/test-airtable")

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`API returned ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        setResult(data)
        setError(null)
      } catch (err) {
        console.error("Error testing Airtable connection:", err)
        setError(err instanceof Error ? err.message : String(err))
        setResult(null)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Airtable Connection Test</h1>

        {loading ? (
          <div className="text-center py-10">Testing Airtable connection...</div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Connection Error</h2>
            <p className="text-red-600 dark:text-red-300 whitespace-pre-wrap">{error}</p>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
            <h2 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">Connection Successful</h2>
            <p className="text-green-600 dark:text-green-300">Successfully connected to Airtable!</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          {envVars ? (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto">
              <pre className="text-sm">{JSON.stringify(envVars, null, 2)}</pre>
            </div>
          ) : (
            <p>Loading environment variables...</p>
          )}
        </div>

        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto">
              <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

