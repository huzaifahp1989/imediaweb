export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Allow', 'POST')
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }

  // Fallback upload endpoint used by the live app when Firebase Storage fails.
  // Wire a storage provider here if you need server-side uploads.
  res.statusCode = 501
  res.end(
    JSON.stringify({
      success: false,
      message: 'Configure /api/upload for server-side fallback uploads, or use Firebase Storage client uploads.',
    }),
  )
}
