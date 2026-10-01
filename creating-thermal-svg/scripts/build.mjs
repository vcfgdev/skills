#!/usr/bin/env node
import {mkdir, readFile, writeFile, access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildSvg, LIMITS, normalize} from '../assets/thermal.mjs';

export async function buildHtml(params = {}) {
  const result = buildSvg(params);
  const template = await readFile(new URL('../assets/preview.html', import.meta.url), 'utf8');
  const engine = await readFile(new URL('../assets/thermal.mjs', import.meta.url), 'utf8');
  const config = JSON.stringify({params: result.params}).replace(/</g, '\\u003c');
  return template.replace('__THERMAL_CONFIG__', () => config)
    .replace('/*__THERMAL_ENGINE__*/', () => engine.replace(/^export /gm, ''));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node scripts/build.mjs --out NEW_DIRECTORY [--config params.json] [--word PRO] [--dur 4.4] [--angle -35] [--edge 8] [--heat 7.3] [--grain .14] [--period 486] [--seed 0]\nWrites index.html, thermal.svg, and thermal.json with the full looping effect. Existing outputs are never overwritten.');
    return;
  }
  let out, configFile;
  const overrides = {};
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i], value = args[i + 1];
    if (!flag.startsWith('--') || value === undefined || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    const key = flag.slice(2);
    if (key === 'out') out = resolve(value);
    else if (key === 'config') configFile = value;
    else if (key === 'word') overrides.word = value;
    else if (Object.hasOwn(LIMITS, key)) overrides[key] = Number(value);
    else throw new Error(`Unknown option: ${flag}`);
  }
  if (!out) throw new Error('--out is required. Choose a new output directory.');
  const config = configFile ? normalize(JSON.parse(await readFile(configFile, 'utf8'))) : {};
  const result = buildSvg({...config, ...overrides});
  const html = await buildHtml(result.params);
  const files = {'index.html': html, 'thermal.svg': result.source, 'thermal.json': JSON.stringify(result.params, null, 2) + '\n'};
  for (const name of Object.keys(files)) {
    const exists = await access(resolve(out, name)).then(() => true, error => {if (error.code === 'ENOENT') return false; throw error;});
    if (exists) throw new Error(`Refusing to overwrite ${resolve(out, name)}. Choose a new --out directory.`);
  }
  await mkdir(out, {recursive: true});
  for (const [name, text] of Object.entries(files)) await writeFile(resolve(out, name), text, {flag: 'wx'});
  console.log(`Created ${out}\nSVG: ${Buffer.byteLength(result.source)} bytes; full effect; ${result.outlined ? 'outlined path' : 'font-based text (system font required)'}\nPreview: ${resolve(out, 'index.html')}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {console.error(error.message); process.exitCode = 1;});
}
