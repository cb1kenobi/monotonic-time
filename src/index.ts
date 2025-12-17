import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const nativeExtRE = /\.node$/;

function locateBinding(): string {
	const baseDir = dirname(dirname(fileURLToPath(import.meta.url)));

	for (const type of ['Release', 'Debug'] as const) {
		try {
			const dir = join(baseDir, 'build', type);
			const files = readdirSync(dir);
			for (const file of files) {
				if (nativeExtRE.test(file)) {
					return resolve(dir, file);
				}
			}
		} catch {}
	}

	// check node_modules
	try {
		const path = join(baseDir, 'node_modules', '@cb1kenobi', `monotonic-time-${process.platform}-${process.arch}`, 'monotonic-time.node');
		if (existsSync(path)) {
			return resolve(path);
		}
	} catch {}

	throw new Error('Unable to locate monotonic-time native binding');
}

const req = createRequire(import.meta.url);
const bindingPath = locateBinding();
console.log(`Loading binding from ${bindingPath}`);
const binding = req(bindingPath);

export const monotonicTime = binding.monotonicTime;
export default monotonicTime;
