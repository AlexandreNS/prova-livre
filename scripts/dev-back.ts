import pmex from 'pmex';

const cwd = './packages/backend';

try {
  pmex('dlx prisma migrate dev', { cwd, stdio: 'ignore' });
} catch {
  pmex('dlx prisma migrate reset --force', { cwd });
}

pmex('dlx prisma db seed', { cwd });

pmex('tsx watch index.ts', { cwd });
