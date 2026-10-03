/**
 * The ffmpeg the trailer is encoded with.
 *
 * The PATH first, then the places the usual installers leave it. winget in
 * particular can install it into its package folder without putting it on
 * the PATH or linking it anywhere that is, which reads as "already
 * installed" and "not found" at the same time. Point FFMPEG at anything else.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** Every ffmpeg.exe winget has unpacked, newest build first. */
function winget(): string[] {
  const local = process.env.LOCALAPPDATA
  if (!local) return []
  const packages = join(local, 'Microsoft', 'WinGet', 'Packages')
  const found = [join(local, 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe')]
  if (!existsSync(packages)) return found
  for (const name of readdirSync(packages)) {
    if (!name.toLowerCase().includes('ffmpeg')) continue
    const builds = readdirSync(join(packages, name)).sort().reverse()
    for (const build of builds) {
      found.push(join(packages, name, build, 'bin', 'ffmpeg.exe'))
    }
  }
  return found
}

const runs = (path: string) =>
  spawnSync(path, ['-version'], { stdio: 'ignore' }).status === 0

/** The first ffmpeg that answers, or an exit with a note on how to name one. */
export function findFfmpeg(script: string): string {
  const candidates = [
    process.env.FFMPEG,
    'ffmpeg',
    ...winget(),
    'C:/ProgramData/chocolatey/bin/ffmpeg.exe',
    join(homedir(), 'scoop', 'shims', 'ffmpeg.exe'),
    '/opt/homebrew/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/usr/bin/ffmpeg',
  ]
  const ffmpeg = candidates.find((p): p is string => !!p && runs(p))
  if (!ffmpeg) {
    console.error(
      `${script} needs ffmpeg (winget install Gyan.FFmpeg, brew install ffmpeg); set FFMPEG to one it cannot find.`,
    )
    process.exit(1)
  }
  return ffmpeg
}
