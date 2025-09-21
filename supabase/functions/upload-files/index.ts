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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const sessionId = formData.get('sessionId') as string

    if (!files.length) {
      throw new Error('No files provided')
    }

    const uploadedFiles = []
    
    for (const file of files) {
      // Upload to Supabase Storage
      const fileName = `${sessionId}/${crypto.randomUUID()}-${file.name}`
      const { data, error } = await supabaseClient.storage
        .from('file-uploads')
        .upload(fileName, file)

      if (error) throw error

      // Store file metadata in database
      const { data: fileRecord, error: dbError } = await supabaseClient
        .from('uploaded_files')
        .insert({
          session_id: sessionId,
          file_name: file.name,
          file_path: data.path,
          file_size: file.size,
          content_type: file.type,
          upload_timestamp: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) throw dbError

      uploadedFiles.push({
        id: fileRecord.id,
        name: file.name,
        size: file.size,
        path: data.path,
        type: 'file'
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        files: uploadedFiles,
        sessionId 
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