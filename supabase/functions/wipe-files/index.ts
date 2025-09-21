import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId, wipeType } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get files for this session
    const { data: files, error } = await supabaseClient
      .from('uploaded_files')
      .select('*')
      .eq('session_id', sessionId)
      .eq('scan_completed', true)

    if (error) throw error

    const wipeResults = []
    
    for (const file of files) {
      try {
        // Delete file from storage
        const { error: deleteError } = await supabaseClient.storage
          .from('file-uploads')
          .remove([file.file_path])

        if (deleteError) throw deleteError

        // Update wipe status in database
        const { error: updateError } = await supabaseClient
          .from('uploaded_files')
          .update({
            wipe_completed: true,
            wipe_timestamp: new Date().toISOString(),
            wipe_type: wipeType,
            wipe_status: 'success'
          })
          .eq('id', file.id)

        if (updateError) throw updateError

        wipeResults.push({
          id: file.id,
          name: file.file_name,
          status: 'success',
          message: `Successfully wiped using ${wipeType} method`
        })

      } catch (fileError) {
        // Mark as failed but continue with other files
        await supabaseClient
          .from('uploaded_files')
          .update({
            wipe_completed: true,
            wipe_timestamp: new Date().toISOString(),
            wipe_type: wipeType,
            wipe_status: 'failed',
            wipe_error: fileError.message
          })
          .eq('id', file.id)

        wipeResults.push({
          id: file.id,
          name: file.file_name,
          status: 'failed',
          message: `Failed to wipe: ${fileError.message}`
        })
      }
    }

    const successCount = wipeResults.filter(r => r.status === 'success').length
    const failedCount = wipeResults.filter(r => r.status === 'failed').length

    return new Response(
      JSON.stringify({ 
        success: true, 
        results: wipeResults,
        summary: {
          total: wipeResults.length,
          successful: successCount,
          failed: failedCount,
          wipeType
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