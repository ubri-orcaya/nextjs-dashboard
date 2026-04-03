import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const eslintBin = path.join(
  projectRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'eslint.cmd' : 'eslint',
);

const result = spawnSync(eslintBin, ['.'], {
  cwd: projectRoot,
  env: {
    ...process.env,
    BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: 'true',
    BROWSERSLIST_IGNORE_OLD_DATA: 'true',
  },
  encoding: 'utf8',
});

const warningPattern =
  /^\[baseline-browser-mapping\] The data in this module is over two months old\..*$/;

const filterOutput = (text) =>
  text
    .split('\n')
    .filter((line) => !warningPattern.test(line))
    .join('\n')
    .trimEnd();

const stdout = result.stdout ? filterOutput(result.stdout) : '';
const stderr = result.stderr ? filterOutput(result.stderr) : '';

if (stdout) {
  process.stdout.write(`${stdout}\n`);
}

if (stderr) {
  process.stderr.write(`${stderr}\n`);
}

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
