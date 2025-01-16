import pmex from 'pmex';

pmex('dlx prisma migrate deploy', { cwd: './packages/backend' });

pmex('tsup src --format=cjs', { cwd: './packages/backend' });
