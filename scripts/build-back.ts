import pmex from 'pmex';

pmex('dlx prisma migrate deploy', { cwd: './packages/backend' });

pmex('dlx prisma generate', { cwd: './packages/backend' });

pmex('tsup src --format=cjs', { cwd: './packages/backend' });
