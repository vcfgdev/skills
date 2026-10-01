#!/usr/bin/env node
import {mkdir, copyFile, writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';

// GitHub mounts this artifact at /skills/, not at the account's domain root.
const out = resolve(process.argv[2] ?? '_site');
try {
  await mkdir(out); // Refuse an existing directory; never delete a caller's files.
  execFileSync(process.execPath, [fileURLToPath(new URL('../creating-thermal-svg/scripts/build.mjs', import.meta.url)), '--out', join(out, 'thermal-svg')], {stdio: 'inherit'});
  await copyFile(new URL('../site/index.html', import.meta.url), join(out, 'index.html'));
  await writeFile(join(out, '.nojekyll'), '');
  console.log(`Pages artifact: ${out}\nPreview route: /skills/thermal-svg/`);
} catch (error) {
  console.error(error.code === 'EEXIST' ? `Output already exists: ${out}. Choose a new directory.` : error.message);
  process.exitCode = 1;
}
