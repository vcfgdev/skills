#!/usr/bin/env bun
import {existsSync, mkdirSync, mkdtempSync, rmSync, statSync} from 'node:fs';
import {basename, dirname, join, resolve} from 'node:path';
import {tmpdir} from 'node:os';

export function run(...command: string[]): Buffer {
  const result = Bun.spawnSync(command, {stdout: 'pipe', stderr: 'pipe'});
  if (result.exitCode !== 0) throw new Error(result.stderr.toString() || `${command[0]} failed`);
  return result.stdout;
}

export function selectFrames(times: number[], start: number, end: number, samples: number, every?: number): number[] {
  const candidates = times.map((time, i) => ({time, i})).filter(({time}) => start <= time && time <= end);
  if (!candidates.length) throw new Error('No frames in the requested timestamp window');
  let selected: number[];
  if (every !== undefined) {
    selected = candidates.filter((_, i) => i % every === 0).map(({i}) => i);
  } else {
    const first = candidates[0].time;
    const last = candidates[candidates.length - 1].time;
    selected = Array.from({length: samples}, (_, slot) => {
      const target = first + (last - first) * slot / (samples - 1);
      return candidates.reduce((best, current) =>
        Math.abs(current.time - target) < Math.abs(best.time - target) ? current : best).i;
    });
    selected = [...new Set(selected)].sort((a, b) => a - b);
  }
  if (selected.length > 256) throw new Error('More than 256 frames selected; narrow --window or increase --every');
  return selected;
}

const usage = 'bun scripts/dissect.ts SOURCE OUTPUT [--window START END] [--samples N | --every N] [--crop W H X Y]';

export function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const options: Record<string, number[]> = {};
  const arities: Record<string, number> = {'--window': 2, '--samples': 1, '--every': 1, '--crop': 4};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--') { positional.push(...argv.slice(i + 1)); break; }
    if (!arg.startsWith('-')) { positional.push(arg); continue; }
    const count = arities[arg];
    if (!count || options[arg]) throw new Error(`Unknown or repeated option: ${arg}\n${usage}`);
    const values = argv.slice(i + 1, i + 1 + count).map(Number);
    if (values.length !== count || !values.every(Number.isFinite)) throw new Error(`Invalid values for ${arg}`);
    options[arg] = values;
    i += count;
  }
  if (positional.length !== 2) throw new Error(usage);
  const samples = options['--samples']?.[0] ?? 12;
  const every = options['--every']?.[0];
  if (!Number.isInteger(samples) || samples < 2 || samples > 64 ||
      (every !== undefined && (!Number.isInteger(every) || every < 1))) {
    throw new Error('samples must be an integer 2–64 and every must be a positive integer');
  }
  if (options['--samples'] && every !== undefined) throw new Error('--samples and --every are mutually exclusive');
  if (every !== undefined && !options['--window']) throw new Error('--every requires --window');
  if (options['--window'] && options['--window'][0] > options['--window'][1]) throw new Error('window requires START <= END');
  if (options['--crop'] && !options['--crop'].every(Number.isInteger)) throw new Error('crop requires integer coordinates');
  return {source: resolve(positional[0]), output: resolve(positional[1]), samples, every,
    window: options['--window'], crop: options['--crop']};
}

type Stream = {width: number; height: number; sample_aspect_ratio?: string; side_data_list?: {rotation?: number}[]};
type Probe = {streams: Stream[]; frames: {best_effort_timestamp_time?: string}[]};

async function main() {
  if (Bun.argv.slice(2).some(arg => arg === '--help' || arg === '-h')) { console.log(usage); return; }
  const args = parseArgs(Bun.argv.slice(2));
  if (!existsSync(args.source) || !statSync(args.source).isFile()) throw new Error('source must be an existing local file');
  if (existsSync(args.output)) throw new Error('output already exists; choose a new directory');
  const probe: Probe = JSON.parse(run('ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_streams',
    '-show_frames', '-show_entries',
    'stream=width,height,sample_aspect_ratio,r_frame_rate,avg_frame_rate,time_base,start_time,duration,nb_frames:stream_side_data=rotation:frame=best_effort_timestamp_time',
    '-of', 'json', args.source).toString());
  const stream = probe.streams[0];
  if (!stream) throw new Error('No video stream');
  if (!['1:1', 'N/A'].includes(stream.sample_aspect_ratio ?? '1:1') ||
      stream.side_data_list?.some(item => (item.rotation ?? 0) !== 0)) {
    throw new Error('Normalize rotation/non-square pixels first; retain the original and its metadata');
  }
  const times = probe.frames.map(frame => Number.parseFloat(frame.best_effort_timestamp_time ?? ''));
  if (!times.length || !times.every(Number.isFinite) || times.some((time, i) => i > 0 && times[i - 1] > time)) {
    throw new Error('Missing or non-monotonic decoded presentation timestamps');
  }
  const [start, end] = args.window ?? [times[0], times[times.length - 1]];
  const selected = selectFrames(times, start, end, args.samples, args.every);
  const crop = args.crop ?? [stream.width, stream.height, 0, 0];
  const [w, h, x, y] = crop;
  if (Math.min(w, h) <= 0 || Math.min(x, y) < 0 || x + w > stream.width || y + h > stream.height) {
    throw new Error('crop must be positive and inside the source raster');
  }
  mkdirSync(dirname(args.output), {recursive: true});
  mkdirSync(args.output);
  const framesDir = join(args.output, 'frames');
  mkdirSync(framesDir);
  await Bun.write(join(args.output, 'probe.json'), JSON.stringify(probe, null, 2) + '\n');
  const selection = selected.map(i => `eq(n\\,${i})`).join('+');
  run('ffmpeg', '-v', 'error', '-noautorotate', '-i', args.source, '-map', '0:v:0',
    '-vf', `select='${selection}',crop=${w}:${h}:${x}:${y}:exact=1`, '-vsync', '0',
    '-frames:v', String(selected.length), join(framesDir, '%03d.png'));
  const evidence = selected.map((index, slot) => ({file: `frames/${String(slot + 1).padStart(3, '0')}.png`,
    source_frame: index, pts_seconds: times[index], elapsed_seconds: times[index] - times[0]}));
  const tiles = mkdtempSync(join(tmpdir(), 'animation-tiles-'));
  try {
    evidence.forEach((item, slot) => {
      const label = `frame ${item.source_frame}  PTS ${item.pts_seconds.toFixed(6)}s`;
      run('ffmpeg', '-v', 'error', '-i', join(args.output, item.file), '-vf',
        'scale=320:180:force_original_aspect_ratio=decrease,' +
        'pad=320:208:(ow-iw)/2:(180-ih)/2:color=0x202020,setsar=1,' +
        `drawtext=text='${label}':x=6:y=188:fontsize=13:fontcolor=white`,
        '-frames:v', '1', join(tiles, `${String(slot + 1).padStart(3, '0')}.png`));
    });
    const columns = Math.min(4, evidence.length);
    const rows = Math.ceil(evidence.length / columns);
    run('ffmpeg', '-v', 'error', '-i', join(tiles, '%03d.png'), '-vf',
      `tile=${columns}x${rows}:color=0x202020`, '-frames:v', '1', join(args.output, 'contact-sheet.png'));
  } finally {
    rmSync(tiles, {recursive: true, force: true});
  }
  const hasher = new Bun.CryptoHasher('sha256');
  for await (const chunk of Bun.file(args.source).stream()) hasher.update(chunk);
  const manifest = {source_name: basename(args.source), source_sha256: hasher.digest('hex'), stream,
    crop, window_pts_seconds: [start, end],
    sampling: {every: args.every ?? null, samples: args.every === undefined ? args.samples : null}, frames: evidence};
  await Bun.write(join(args.output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Extracted ${evidence.length} frames: ${join(args.output, 'contact-sheet.png')}`);
}

if (import.meta.main) {
  main().catch(error => { console.error(`Extraction failed: ${error.message}`); process.exitCode = 1; });
}
