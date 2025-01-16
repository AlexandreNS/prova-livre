import pmex from 'pmex';

import 'dotenv/config';

pmex('prettier "packages/*/src/**/*.{js,jsx,ts,tsx}" --check');

pmex('eslint "packages/*/src/**/*.{js,jsx,ts,tsx}" --max-warnings=0');

pmex('tsc --noEmit --skipLibCheck');
