const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

function getArg(name, def) {
  const i = process.argv.findIndex(a => a === name)
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1]
  return def
}

const input = getArg('--input')
const outDir = getArg('--out', path.resolve(process.cwd(), 'public', 'asma'))
const timestampsPath = getArg('--timestamps')
const namesPath = getArg('--names')
const mode = getArg('--mode', 'number')

if (!input || !timestampsPath) {
  console.error('Usage: node scripts/split-asma-audio.js --input <all.mp3> --timestamps <timestamps.json> [--out <outDir>] [--names <names.json>] [--mode number|name]')
  process.exit(1)
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

const timestamps = JSON.parse(fs.readFileSync(timestampsPath, 'utf8'))
let names = []
if (namesPath && fs.existsSync(namesPath)) {
  names = JSON.parse(fs.readFileSync(namesPath, 'utf8'))
}

function sanitize(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function buildOutFile(i) {
  if (mode === 'name' && names[i] && names[i].transliteration) {
    return path.join(outDir, `${sanitize(names[i].transliteration)}.mp3`)
  }
  return path.join(outDir, `${i + 1}.mp3`)
}

async function runFfmpeg(start, end, outFile) {
  return new Promise((resolve, reject) => {
    const args = ['-hide_banner', '-y', '-i', input, '-ss', String(start)]
    if (end != null) args.push('-to', String(end))
    args.push('-c:a', 'libmp3lame', '-q:a', '2', outFile)
    const p = spawn('ffmpeg', args, { stdio: 'inherit' })
    p.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited with code ${code}`))
    })
  })
}

;(async () => {
  if (!Array.isArray(timestamps) || timestamps.length === 0) {
    console.error('timestamps.json must be an array of { start, end } entries')
    process.exit(1)
  }
  for (let i = 0; i < timestamps.length; i++) {
    const t = timestamps[i]
    const outFile = buildOutFile(i)
    await runFfmpeg(t.start, t.end, outFile)
    console.log(`Created ${outFile}`)
  }
  console.log('Done')
})().catch(e => {
  console.error(e && e.message ? e.message : String(e))
  process.exit(1)
})
