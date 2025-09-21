import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Sensitive keywords for scanning
const SENSITIVE_KEYWORDS = [
  'password', 'ssn', 'social security', 'aadhar', 'aadhaar', 'bank', 'credit card',
  'passport', 'license', 'tax', 'salary', 'confidential', 'secret', 'private',
  'personal', 'financial', 'medical', 'insurance', 'login', 'auth', 'token',
  'key', 'certificate', 'identity', 'driver', 'birth certificate'
]

const HIGH_RISK_KEYWORDS = [
  'ssn', 'social security', 'bank account', 'credit card', 'password', 'secret',
  'confidential', 'tax return', 'medical record', 'passport'
]

function analyzeFileName(fileName: string): 'low' | 'medium' | 'high' {
  const lowerName = fileName.toLowerCase()
  
  // Check for high-risk keywords
  for (const keyword of HIGH_RISK_KEYWORDS) {
    if (lowerName.includes(keyword)) {
      return 'high'
    }
  }
  
  // Check for medium-risk keywords
  for (const keyword of SENSITIVE_KEYWORDS) {
    if (lowerName.includes(keyword)) {
      return 'medium'
    }
  }
  
  return 'low'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get files for this session
    const { data: files, error } = await supabaseClient
      .from('uploaded_files')
      .select('*')
      .eq('session_id', sessionId)

    if (error) throw error

    const scannedFiles = []
    
    for (const file of files) {
      // Analyze filename for sensitive content
      const riskLevel = analyzeFileName(file.file_name)
      
      // Update scan results in database
      const { error: updateError } = await supabaseClient
        .from('uploaded_files')
        .update({
          risk_level: riskLevel,
          scan_timestamp: new Date().toISOString(),
          scan_completed: true
        })
        .eq('id', file.id)

      if (updateError) throw updateError

      scannedFiles.push({
        id: file.id,
        name: file.file_name,
        size: file.file_size,
        path: file.file_path,
        type: 'file',
        riskLevel
      })
    }

    // Calculate recommendation
    const hasHighRisk = scannedFiles.some(file => file.riskLevel === 'high')
    const recommendedWipeType = hasHighRisk ? 'advanced' : 'standard'

    return new Response(
      JSON.stringify({ 
        success: true, 
        files: scannedFiles,
        recommendedWipeType,
        summary: {
          total: scannedFiles.length,
          high: scannedFiles.filter(f => f.riskLevel === 'high').length,
          medium: scannedFiles.filter(f => f.riskLevel === 'medium').length,
          low: scannedFiles.filter(f => f.riskLevel === 'low').length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})