export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Allow', 'POST')
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }
  res.statusCode = 200
  res.end(
    JSON.stringify({
      success: true,
      stats: null,
      message: 'Use client-side analytics from track library; server aggregation optional.',
    }),
  )
}
