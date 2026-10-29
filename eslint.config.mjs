import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Part images are SVG illustrations or already-optimised WebP uploads served with
      // long cache headers, so next/image's optimiser adds nothing.
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  { ignores: ['src/generated/**', '.next/**', 'node_modules/**', 'next-env.d.ts'] },
];

export default config;
