import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced sensitive content detection
const CRITICAL_KEYWORDS = [
  'ssn', 'social security number', 'social security', 'ein', 'tax id', 'taxpayer id',
  'bank account', 'routing number', 'credit card', 'debit card', 'cvv', 'cvc',
  'passport', 'driver license', 'driver licence', 'national id', 'identity card',
  'birth certificate', 'death certificate', 'marriage certificate',
  'medical record', 'patient record', 'health record', 'hospital record',
  'prescription', 'diagnosis', 'treatment', 'hipaa', 'phi',
  'salary', 'payroll', 'w2', 'w-2', '1099', 'tax return', 'irs',
  'classified', 'top secret', 'confidential', 'proprietary', 'trade secret',
  'api key', 'private key', 'secret key', 'auth token', 'access token',
  'password', 'passwd', 'pwd', 'pin', 'security code'
]

const HIGH_RISK_KEYWORDS = [
  'ssn', 'social security', 'bank account', 'credit card', 'passport', 'driver license',
  'medical record', 'tax return', 'classified', 'top secret', 'api key', 'private key',
  'password', 'secret', 'confidential', 'proprietary', 'national id', 'birth certificate'
]

const MEDIUM_RISK_KEYWORDS = [
  'personal', 'private', 'internal', 'restricted', 'sensitive', 'confidential',
  'employee', 'salary', 'payroll', 'financial', 'insurance', 'legal',
  'contract', 'agreement', 'license', 'certificate', 'token', 'auth',
  'login', 'signin', 'account', 'profile', 'identity', 'address',
  'phone', 'email', 'contact', 'emergency', 'family', 'relationship'
]

// File extension risk assessment
const HIGH_RISK_EXTENSIONS = [
  '.p12', '.pfx', '.pem', '.key', '.crt', '.cer', '.der', '.jks', '.keystore',
  '.wallet', '.kdb', '.kdbx', '.asc', '.gpg', '.pgp', '.enc'
]

const MEDIUM_RISK_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf',
  '.csv', '.json', '.xml', '.sql', '.db', '.sqlite', '.mdb', '.accdb'
]

function analyzeFileName(fileName: string, fileSize: number): 'low' | 'medium' | 'high' {
  const lowerName = fileName.toLowerCase()
  const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  
  // Check file extension first
  if (HIGH_RISK_EXTENSIONS.includes(fileExtension)) {
    return 'high'
  }
  
  if (MEDIUM_RISK_EXTENSIONS.includes(fileExtension)) {
    // Further analyze based on filename and size
    for (const keyword of CRITICAL_KEYWORDS) {
      if (lowerName.includes(keyword)) {
        return 'high'
      }
    }
    
    for (const keyword of HIGH_RISK_KEYWORDS) {
      if (lowerName.includes(keyword)) {
        return 'high'
      }
    }
    
    // Large files with medium-risk extensions get elevated
    if (fileSize > 10 * 1024 * 1024) { // 10MB+
      for (const keyword of MEDIUM_RISK_KEYWORDS) {
        if (lowerName.includes(keyword)) {
          return 'medium'
        }
      }
    }
  }
  
  // Check for critical keywords in filename
  for (const keyword of CRITICAL_KEYWORDS) {
    if (lowerName.includes(keyword)) {
      return 'high'
    }
  }
  
  // Check for high-risk keywords
  for (const keyword of HIGH_RISK_KEYWORDS) {
    if (lowerName.includes(keyword)) {
      return 'high'
    }
  }
  
  // Check for medium-risk keywords
  for (const keyword of MEDIUM_RISK_KEYWORDS) {
    if (lowerName.includes(keyword)) {
      return 'medium'
    }
  }

  // Pattern matching for common sensitive data patterns
  if (lowerName.match(/\d{3}-\d{2}-\d{4}/) || // SSN pattern
      lowerName.match(/\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/) || // Credit card pattern
      lowerName.match(/[a-z0-9]{32}/) || // MD5/API key pattern
      lowerName.match(/[a-z0-9]{40}/) || // SHA1 pattern
      lowerName.match(/[a-z0-9]{64}/)) { // SHA256 pattern
    return 'high'
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
      // Analyze filename and size for sensitive content
      const riskLevel = analyzeFileName(file.file_name, file.file_size)
      
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
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})