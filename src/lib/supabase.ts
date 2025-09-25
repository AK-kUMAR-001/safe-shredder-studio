import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type FileUploadResult = {
  id: string
  name: string
  size: number
  path: string
  type: 'file' | 'folder'
}

export type ScanResult = {
  id: string
  name: string
  size: number
  path: string
  type: 'file' | 'folder'
  riskLevel: 'low' | 'medium' | 'high'
}

export type WipeResult = {
  id: string
  name: string
  status: 'success' | 'failed'
  message: string
}

// API functions for file operations
export const fileAPI = {
  // Upload files to Supabase
  async uploadFiles(files: File[]): Promise<{ files: FileUploadResult[], sessionId: string }> {
    const sessionId = crypto.randomUUID()
    const formData = new FormData()
    
    files.forEach(file => formData.append('files', file))
    formData.append('sessionId', sessionId)

    const response = await fetch(`${supabaseUrl}/functions/v1/upload-files`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Upload failed:', errorText)
      throw new Error(`Upload failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    return result
  },

  // Scan uploaded files for sensitive content
  async scanFiles(sessionId: string): Promise<{ 
    files: ScanResult[], 
    recommendedWipeType: 'standard' | 'advanced',
    summary: { total: number, high: number, medium: number, low: number }
  }> {
    const response = await fetch(`${supabaseUrl}/functions/v1/scan-files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sessionId })
    })

    if (!response.ok) {
      throw new Error('Scan failed')
    }

    return await response.json()
  },

  // Securely wipe files
  async wipeFiles(sessionId: string, wipeType: 'standard' | 'advanced'): Promise<{
    results: WipeResult[],
    summary: { total: number, successful: number, failed: number, wipeType: string }
  }> {
    const response = await fetch(`${supabaseUrl}/functions/v1/wipe-files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sessionId, wipeType })
    })

    if (!response.ok) {
      throw new Error('Wipe operation failed')
    }

    return await response.json()
  }
}