import {afterEach, beforeEach, expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {parseArgs, run, selectFrames} from './dissect';

const script = join(import.meta.dir, 'dissect.ts');
let root: string;
beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'dissect-test-')); });
afterEach(() => { rmSync(root, {recursive: true, force: true}); });

function dimensions(path: string) {
  const bytes = readFileSync(path);
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

function extract(source: string, name: string, ...options: string[]) {
  const output = join(root, name);
  run(process.execPath, script, source, output, ...options);
  const manifest = JSON.parse(readFileSync(join(output, 'manifest.json'), 'utf8')) as {
    frames: {source_frame: number; pts_seconds: number}[];
  };
  return {output, manifest};
}

test('sampling uses timestamps, inclusive windows, earlier ties and deduplication', () => {
  expect(selectFrames([2, 2.1, 2.4, 3], 2, 3, 3)).toEqual([0, 2, 3]);
  expect(selectFrames([2, 2.1, 2.4, 3], 2.1, 3, 12, 2)).toEqual([1, 3]);
  expect(selectFrames([0, 0.25, 0.75, 1], 0, 1, 3)).toEqual([0, 1, 3]);
  expect(selectFrames([0, 0.1], 0, 0.1, 12)).toEqual([0, 1]);
});

test('empty windows and excessive dense selection fail', () => {
  expect(() => selectFrames([0, 1], 0.2, 0.8, 12)).toThrow('No frames');
  expect(() => selectFrames(Array.from({length: 257}, (_, i) => i), 0, 256, 12, 1)).toThrow('256');
});

test('CLI retains multi-value options and rejects invalid input', () => {
  expect(parseArgs(['in', 'out', '--window', '-1', '3', '--every', '2', '--crop', '71', '93', '17', '25']))
    .toMatchObject({window: [-1, 3], every: 2, crop: [71, 93, 17, 25]});
  for (const options of [['--samples', '1'], ['--samples', '3.5'], ['--every', '0'],
    ['--every', '2'], ['--window', '3', '2'], ['--window', 'NaN', '2'], ['--crop', '1', '2'],
    ['--window', '0', '1', '--samples', '4', '--every', '1'], ['--unknown']]) {
    expect(() => parseArgs(['in', 'out', ...options])).toThrow();
  }
});

test('short landscape clip and existing-output protection', () => {
  const source = join(root, 'short clip.mkv');
  run('ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=red:size=320x160:rate=10:duration=0.2',
    '-c:v', 'ffv1', source);
  const {output, manifest} = extract(source, 'overview');
  expect(manifest.frames.map(f => f.pts_seconds)).toEqual([0, 0.1]);
  expect(dimensions(join(output, 'frames/001.png'))).toEqual([320, 160]);
  expect(dimensions(join(output, 'contact-sheet.png'))).toEqual([640, 208]);
  const before = readFileSync(join(output, 'manifest.json'));
  expect(() => run(process.execPath, script, source, output)).toThrow('output already exists');
  expect(readFileSync(join(output, 'manifest.json'))).toEqual(before);
});

test('VFR nonzero timestamps, portrait letterboxing and exact asymmetric crop', () => {
  const source = join(root, 'vfr.mkv');
  run('ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'testsrc=size=160x320:rate=10:duration=1.1',
    '-vf', "select='eq(n,0)+eq(n,1)+eq(n,4)+eq(n,10)',setpts=PTS+2/TB", '-vsync', '0', '-c:v', 'ffv1', source);
  const {output, manifest} = extract(source, 'overview', '--samples', '3');
  expect(manifest.frames.map(f => f.source_frame)).toEqual([0, 2, 3]);
  expect(manifest.frames.map(f => f.pts_seconds)).toEqual([2, 2.4, 3]);
  expect(dimensions(join(output, 'frames/002.png'))).toEqual([160, 320]);
  const raw = run('ffmpeg', '-v', 'error', '-i', join(output, 'contact-sheet.png'), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-');
  for (const x of [10, 110, 210, 310]) {
    const offset = (90 * 960 + x) * 3;
    expect([...raw.subarray(offset, offset + 3)]).toEqual([32, 32, 32]);
  }
  const crop = extract(source, 'crop', '--window', '2.1', '3', '--every', '2', '--crop', '71', '93', '17', '25');
  expect(crop.manifest.frames.map(f => f.source_frame)).toEqual([1, 3]);
  expect(dimensions(join(crop.output, 'frames/001.png'))).toEqual([71, 93]);
  const expected = join(root, 'expected.png');
  run('ffmpeg', '-v', 'error', '-i', source, '-vf', "select='eq(n,1)',crop=71:93:17:25:exact=1",
    '-vsync', '0', '-frames:v', '1', expected);
  expect(readFileSync(join(crop.output, 'frames/001.png'))).toEqual(readFileSync(expected));
});
