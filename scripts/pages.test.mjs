import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

test('Pages artifact mounts below /skills/ without touching /konpeki/', async () => {
  const root = await mkdtemp(join(tmpdir(), 'skills-pages-'));
  const out = join(root, 'skills');
  const script = fileURLToPath(new URL('./build-pages.mjs', import.meta.url));
  try {
    const build = spawnSync(process.execPath, [script, out], {encoding: 'utf8'});
    assert.equal(build.status, 0, build.stderr);
    assert.deepEqual((await readdir(out)).sort(), ['.nojekyll', 'index.html', 'thermal-svg']);
    assert.deepEqual((await readdir(join(out, 'thermal-svg'))).sort(), ['index.html', 'thermal.json', 'thermal.svg']);
    const home = await readFile(join(out, 'index.html'), 'utf8');
    const link = home.match(/class="preview" href="([^"]+)"/)[1];
    assert.equal(new URL(link, 'https://vcfgdev.github.io/skills/').pathname, '/skills/thermal-svg/');
    const html = await readFile(join(out, 'thermal-svg/index.html'), 'utf8');
    assert.match(html, /<html lang="en">/);
    assert(!/(?:src|href)="\//.test(html), 'No origin-root assets');
    assert(!/serviceWorker|localStorage|sessionStorage/.test(html), 'No shared-origin persistent state');
    const svg = await readFile(join(out, 'thermal-svg/thermal.svg'), 'utf8');
    assert.equal(svg, await readFile(new URL('../creating-thermal-svg/reference/pro-thermal.svg', import.meta.url), 'utf8'));
    const again = spawnSync(process.execPath, [script, out], {encoding: 'utf8'});
    assert.equal(again.status, 1);
    assert.match(again.stderr, /Output already exists/);
    assert.equal(await readFile(join(out, 'thermal-svg/index.html'), 'utf8'), html);
  } finally {await rm(root, {recursive: true, force: true});}
});
