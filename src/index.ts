import { dirname, join, parse, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';

const nativeExtRE = /\.node$/;

function locateBinding(): string {
	let baseDir = dirname(dirname(fileURLToPath(import.meta.url)));

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
	const { root } = parse(baseDir);
	while (baseDir !== root) {
		try {
			const path = join(baseDir, 'node_modules', '@cb1kenobi', `monotonic-time-${process.platform}-${process.arch}`, 'monotonic-time.node');
			if (statSync(path).isFile()) {
				return path;
			}
		} catch {}
		baseDir = dirname(baseDir);
	}

	throw new Error('Unable to locate monotonic-time native binding');
}

const req = createRequire(import.meta.url);
const bindingPath = locateBinding();
// console.log(`Loading binding from ${bindingPath}`);
const binding = req(bindingPath);

export const monotonicTime: () => number = binding.monotonicTime;
export default monotonicTime;
