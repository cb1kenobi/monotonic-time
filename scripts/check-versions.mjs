import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = fileURLToPath(dirname(import.meta.url));
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf8'));
const { name, version, optionalDependencies } = packageJson;

console.log(`Package: ${name}@${version}`);
console.log('Optional dependencies:', optionalDependencies);
console.log();

// check that the optional dependencies have the same version as the main package
const mismatched = Object.entries(optionalDependencies)
	.filter(([_key, value]) => value !== version);
if (mismatched.length > 0) {
	for (const [key, value] of mismatched) {
		console.error(`ERROR: Version mismatch for ${key}: ${value} !== ${version}`);
	}
	process.exit(1);
}
console.log('All versions match\n');

// check that the version hasn't already been published to npm
const published = execFileSync('npm', ['view', packageJson.name, 'version']);
if (published.toString().trim() === version) {
	console.error(`ERROR: Version ${version} has already been published to npm!`);
	process.exit(1);
}
console.log('Version has not been published to npm\n');
