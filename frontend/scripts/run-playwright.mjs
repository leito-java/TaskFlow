import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const playwrightCli = require.resolve('@playwright/test/cli');
const environment = {
  ...process.env,
  PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH ?? '0',
};

const result = spawnSync(
  process.execPath,
  [playwrightCli, 'test', ...process.argv.slice(2)],
  { env: environment, stdio: 'inherit' },
);

process.exit(result.status ?? 1);
