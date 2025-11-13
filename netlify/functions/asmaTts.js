import { getSupabase } from './_supabaseAdmin.js'

export async function handler(event) {
  try {
    const body = JSON.parse(event.body || '{}')
    const idx = Number(body.idx ?? 0)
    const text = String(body.arabic ?? '').trim()
    const voice = String(body.voice ?? 'ar-SA-HamedNeural')
    const rate = String(body.rate ?? '0%')
    const pitch = String(body.pitch ?? '0%')
    if (!text) return { statusCode: 400, body: 'Missing arabic text' }

    const key = process.env.AZURE_TTS_KEY || ''
    const region = process.env.AZURE_TTS_REGION || ''
    if (!key || !region) return { statusCode: 500, body: 'TTS not configured' }

    const ssml = `<speak version="1.0" xml:lang="ar-SA"><voice name="${voice}"><prosody rate="${rate}" pitch="${pitch}">${text}</prosody></voice></speak>`
    const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3'
      },
      body: ssml
    })
    if (!res.ok) return { statusCode: 500, body: 'TTS failed' }
    const ab = await res.arrayBuffer()
    const buf = Buffer.from(ab)

    const { supabase } = getSupabase()
    const bucket = 'Asma'
    const path = `neural/${idx + 1}.mp3`
    const upload = await supabase.storage.from(bucket).upload(path, buf, { contentType: 'audio/mpeg', upsert: true })
    if (upload.error) return { statusCode: 500, body: 'Upload failed' }
    const pub = `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
    return { statusCode: 200, body: JSON.stringify({ url: pub }) }
  } catch (e) {
    return { statusCode: 500, body: 'Server error' }
  }
}
