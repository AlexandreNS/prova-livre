import { execSync } from 'node:child_process';
import pmex from 'pmex';

pmex('dlx prisma generate', { cwd: './packages/backend' });

execSync('node dist/main.js', { cwd: './packages/backend', stdio: 'inherit' });
