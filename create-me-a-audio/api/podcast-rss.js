export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET')
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }

  // Mirrors the live create-me-a-audio podcast endpoint shape.
  const episodes = [
    {
      id: 'da76338a-2ee8-461b-bdad-7087b9388c67',
      title: 'Allah is close to you then you think (Mufti Ismail Hafej)',
      description: 'Short Islamic reminders',
      publishedAt: 1766274054000,
      audioUrl:
        'https://anchor.fm/s/21dd8c4c/podcast/play/112924734/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2025-11-20%2F21ca984e-283a-e6e7-a6c2-fd32e0cba1ad.mp3',
    },
  ]

  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.end(JSON.stringify({ success: true, episodes }))
}
