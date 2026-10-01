import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, writeFile, mkdtemp, rm, readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import {buildSvg, normalize, LIMITS} from '../assets/thermal.mjs';
import {buildHtml} from './build.mjs';

test('default source is byte-identical to the supplied SVG', async () => {
  const reference = await readFile(new URL('../reference/pro-thermal.svg', import.meta.url), 'utf8');
  assert.equal(buildSvg().source, reference);
  assert.equal(Buffer.byteLength(reference), 3294);
});

test('every stage is complete and exposes the exact generated lines', () => {
  for (let stage = 1; stage <= 5; stage++) {
    const {source, lines} = buildSvg({}, stage);
    assert.equal(source, lines.map(line => line.text).join('\n') + '\n');
    assert.match(source, /^<svg[\s\S]*<path[\s\S]*<\/svg>\n$/);
    assert.equal(source.includes('<filter id="material"'), stage >= 2);
    assert.equal(source.includes('<linearGradient'), stage >= 3);
    assert.equal(source.includes('<feComponentTransfer>'), stage >= 4);
    assert.equal(source.includes('<feTurbulence'), stage === 5);
    assert(lines.every(line => line.from <= stage));
    for (const [, id] of source.matchAll(/url\(#([^)]+)\)/g)) assert(source.includes(`id="${id}"`));
  }
});

test('direction, zero values, noise compensation and LUT use actual parameters', () => {
  const {source} = buildSvg({angle: 30, period: 200, dur: 2.75, edge: 0, heat: 0, grain: 0, seed: 23, palette: ['#ff0080', '#00ff40', '#ffffff']});
  assert.match(source, /x2="173" y2="100"/);
  assert.match(source, /to="173 100" dur="2.75s"/);
  assert.match(source, /in="SourceAlpha" stdDeviation="0"/);
  assert.match(source, /in="SourceGraphic" stdDeviation="0"/);
  assert.match(source, /seed="23"/);
  assert.match(source, /k3="0" k4="-.38"/);
  assert.match(source, /feFuncR type="table" tableValues="1 0 1"/);
  assert.match(source, /feFuncG type="table" tableValues="0 1 1"/);
  assert.match(source, /feFuncB type="table" tableValues=".5 .25 1"/);
  assert.match(buildSvg({grain: .46, angle: -90, period: 111}).source, /x2="0" y2="-111"/);
  assert.match(buildSvg({grain: .46}).source, /k3=".46" k4="-.61"/);
});

test('custom compound path preserves non-origin bounds and fill rule', () => {
  const path = 'M-25 17H185V112H-25Z M0 30V90H100V30Z';
  const result = buildSvg({path, bounds: [-25, 17, 210, 95], fillRule: 'evenodd'});
  assert.equal(result.outlined, true);
  assert.match(result.source, /viewBox="-37 5 234 119"/);
  assert(result.source.includes(`d="${path}" fill-rule="evenodd"`));
  assert(!result.source.includes('<text'));
});

test('text is escaped, Unicode is counted, and text mode is identified', () => {
  const result = buildSvg({word: '<热&"感\'>'});
  assert.equal(result.outlined, false);
  assert.match(result.source, /&lt;热&amp;&quot;感&apos;&gt;<\/text>/);
  assert.match(result.source, /font-family="Arial, Noto Sans CJK SC, sans-serif"/);
  assert.doesNotThrow(() => normalize({word: '😀'.repeat(32)}));
  assert.throws(() => normalize({word: '😀'.repeat(33)}));
});

test('invalid parameters reject rather than silently changing the output', () => {
  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    for (const value of [min, max]) assert.doesNotThrow(() => normalize({[key]: value}));
    for (const value of [min - 1, max + 1, NaN, Infinity, String(min)]) assert.throws(() => normalize({[key]: value}));
  }
  for (const value of [null, [], {constructor: 1}, {word: ''}, {word: '\u0000'}, {seed: 1.5}, {palette: ['#fff', '#000']}, {stops: []}, {path: '<path/>'}, {path: 'M0 0" onload="x'}, {bounds: [0, 0, -1, 2]}, {fillRule: 'bad'}]) assert.throws(() => normalize(value));
  for (const stage of [0, 6, 2.5, '5']) assert.throws(() => buildSvg({}, stage));
});

test('offline HTML safely embeds config and the same executable engine', async () => {
  const config = {word: '</script><b>热感', dur: 3.7, angle: 71};
  const html = await buildHtml(config, 4);
  assert.equal((html.match(/<script\b/g) || []).length, 2);
  assert(!html.includes('__THERMAL_'));
  assert(!/<(?:script|link)[^>]+(?:src|href)=/.test(html));
  const embedded = JSON.parse(html.match(/type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(embedded.params.word, config.word);
  assert.equal(embedded.stage, 4);
  const engine = html.match(/<script type="module" id="thermal-app">([\s\S]*?)\nconst \$ =/)[1];
  const source = runInNewContext(engine + '\nbuildSvg(config, 4).source', {config});
  assert.equal(source, buildSvg(config, 4).source);
});

test('CLI round-trips parameters and refuses existing outputs without altering them', async () => {
  const root = await mkdtemp(join(tmpdir(), 'thermal-test-'));
  const cli = fileURLToPath(new URL('./build.mjs', import.meta.url));
  try {
    const config = join(root, 'params.json'), out = join(root, 'result');
    await writeFile(config, JSON.stringify({word: '热感', angle: 71, grain: .32}));
    const args = [cli, '--out', out, '--config', config, '--angle', '-28', '--stage', '3'];
    const first = spawnSync(process.execPath, args, {encoding: 'utf8'});
    assert.equal(first.status, 0, first.stderr);
    const svg = await readFile(join(out, 'thermal.svg'), 'utf8');
    assert.equal(svg, buildSvg({word: '热感', angle: -28, grain: .32}, 3).source);
    const saved = JSON.parse(await readFile(join(out, 'thermal.json'), 'utf8'));
    assert.equal(buildSvg(saved, 3).source, svg);
    const before = await Promise.all(['index.html', 'thermal.svg', 'thermal.json'].map(n => readFile(join(out, n), 'utf8')));
    const second = spawnSync(process.execPath, args, {encoding: 'utf8'});
    assert.equal(second.status, 1);
    assert.match(second.stderr, /Refusing to overwrite/);
    assert.deepEqual(await Promise.all(['index.html', 'thermal.svg', 'thermal.json'].map(n => readFile(join(out, n), 'utf8'))), before);
    await writeFile(config, 'null');
    assert.equal(spawnSync(process.execPath, [cli, '--out', join(root, 'invalid'), '--config', config]).status, 1);
    assert(!(await readdir(root)).includes('invalid'));
  } finally {await rm(root, {recursive: true, force: true});}
});
