"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function AirtableStatusPage() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true)

        // Test Airtable connection
        const response = await fetch("/api/test-airtable")
        const data = await response.json()

        setStatus(data)

        if (!data.success) {
          setError(data.error || "Unknown error occurred")
        }
      } catch (err) {
        console.error("Error checking Airtable status:", err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
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
        <h1 className="text-2xl font-bold mb-6">Airtable Connection Status</h1>

        {loading ? (
          <div className="text-center py-10">Checking Airtable connection...</div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Connection Error</h2>
            </div>
            <p className="mt-2 text-red-600 dark:text-red-300">{error}</p>
          </div>
        ) : status?.success ? (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">Connection Successful</h2>
            </div>
            <p className="mt-2 text-green-600 dark:text-green-300">
              Successfully connected to Airtable! Found {status.recordCount} record(s).
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <h2 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">Connection Warning</h2>
            </div>
            <p className="mt-2 text-yellow-600 dark:text-yellow-300">
              Connection test completed but with issues. Check the details below.
            </p>
          </div>
        )}

        {status && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">API Key:</p>
                  <p>{status.envStatus?.apiKeyExists ? "✅ Set" : "❌ Not set"}</p>
                  {status.envStatus?.apiKeyExists && (
                    <p className="text-sm text-gray-500">Length: {status.envStatus.apiKeyLength} characters</p>
                  )}
                </div>
                <div>
                  <p className="font-medium">Base ID:</p>
                  <p>{status.envStatus?.baseIdExists ? `✅ Set (${status.envStatus.baseIdValue})` : "❌ Not set"}</p>
                </div>
                <div>
                  <p className="font-medium">Table Name:</p>
                  <p>
                    {status.envStatus?.tableNameExists ? `✅ Set (${status.envStatus.tableNameValue})` : "❌ Not set"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Environment:</p>
                  <p>{status.envStatus?.nodeEnv || "Unknown"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
              <h3 className="font-medium">1. Check Environment Variables</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Make sure you have set the following environment variables in your Vercel project:
              </p>
              <ul className="list-disc ml-5 mt-2 text-gray-600 dark:text-gray-400">
                <li>AIRTABLE_API_KEY or AIRTABLE_PAT</li>
                <li>AIRTABLE_BASE_ID</li>
                <li>AIRTABLE_CONTACTS_TABLE_NAME</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
              <h3 className="font-medium">2. Verify API Key Format</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Ensure your Airtable API key is correctly formatted:
              </p>
              <ul className="list-disc ml-5 mt-2 text-gray-600 dark:text-gray-400">
                <li>API keys typically start with "key" followed by alphanumeric characters</li>
                <li>Personal Access Tokens (PAT) are longer and have a different format</li>
                <li>Make sure there are no extra spaces or special characters</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
              <h3 className="font-medium">3. Check Base and Table Access</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Verify that your API key has access to the specified base and table:
              </p>
              <ul className="list-disc ml-5 mt-2 text-gray-600 dark:text-gray-400">
                <li>Confirm the Base ID is correct</li>
                <li>Ensure the table name matches exactly (case-sensitive)</li>
                <li>Check that your API key has permission to access this base</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
              <h3 className="font-medium">4. Regenerate API Key</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                If all else fails, try generating a new API key in Airtable and updating your environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

