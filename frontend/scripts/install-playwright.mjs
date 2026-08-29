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
  [playwrightCli, 'install', 'chromium'],
  { env: environment, stdio: 'inherit' },
);

process.exit(result.status ?? 1);
