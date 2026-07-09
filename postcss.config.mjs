import tailwindcss from '@tailwindcss/postcss';
//import tailwindConfig from './tailwind.config.ts';
import path from 'path';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: [
    tailwindcss({
        base: path.resolve(__dirname, './tailwind.config.ts'),
    })
  ],
};