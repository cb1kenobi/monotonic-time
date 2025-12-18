import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
	entry: './src/index.ts',
	format: ['es', 'cjs'],
	minify: !process.env.SKIP_MINIFY,
	platform: 'node',
	sourcemap: true,
	tsconfig: './tsconfig.build.json'
});
export default config;
