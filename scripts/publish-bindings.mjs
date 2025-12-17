import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = fileURLToPath(dirname(import.meta.url));
const {
	homepage,
	license,
	name,
	optionalDependencies,
	version
} = JSON.parse(await readFile(resolve(__dirname, '..', 'package.json'), 'utf8'));

console.log({
	homepage,
	license,
	name,
	optionalDependencies,
	version
});

console.log(await readdir(resolve(__dirname, '..', 'artifacts')));
