import { execSync } from 'node:child_process';
import { args } from 'pmex';

execSync(`prisma ${args().$}`, {
  encoding: 'utf-8',
  cwd: './packages/backend',
  stdio: 'inherit',
});
