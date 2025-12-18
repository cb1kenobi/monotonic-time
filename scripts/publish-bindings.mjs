import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const __dirname = fileURLToPath(dirname(import.meta.url));
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf8'));
const tag = process.env.TAG;
const artifactsDir = resolve(__dirname, '..', 'artifacts');
const name = 'monotonic-time';
const bindingFilename = `${name}.node`;
const bindings = {};

// find all bindings in the artifacts directory
for (const target of readdirSync(artifactsDir)) {
	try {
		const binding = join(artifactsDir, target, bindingFilename);
		if (statSync(binding).isFile()) {
			console.log('Found binding:', binding);
			bindings[target] = binding;
		}
	} catch {
		// ignore
	}
}
console.log();

// cross check the bindings against the optionalDependencies
for (const dep of Object.keys(packageJson.optionalDependencies)) {
	const target = dep.replace(`${packageJson.name}-`, '');
	if (!bindings[target]) {
		throw new Error(`Binding for ${dep} not found in artifacts`);
	}
	console.log(`Matched binding for ${dep} -> ${relative(dirname(artifactsDir), bindings[target])}`);
}
console.log();

for (const target of Object.keys(bindings)) {
	const [platform, arch] = target.split('-');
	const packageName = `${packageJson.name}-${target}`;
	const pkgJson = JSON.stringify({
		name: packageName,
		version: packageJson.version,
		description: `${target} binding for ${name}`,
		license: packageJson.license,
		main: bindingFilename,
		exports: {
			'.': bindingFilename
		},
		files: [ bindingFilename ],
		preferUnplugged: true,
		engines: packageJson.engines,
		os: [ platform ],
		cpu: [ arch ]
	}, null, 2);

	console.log('Publishing:', pkgJson);

	const tmpDir = join(tmpdir(), `${name}-${target}-${packageJson.version}`);
	mkdirSync(tmpDir, { recursive: true });

	copyFileSync(bindings[target], join(tmpDir, bindingFilename));
	writeFileSync(join(tmpDir, 'README.md'), `# ${name}-${target}\n\n` +
		`${target} binding for [${name}](https://npmjs.com/package/${packageName}).`);
	writeFileSync(join(tmpDir, 'package.json'), pkgJson);

	execFileSync('pnpm', ['publish', '--access', 'public', '--dry-run', '--tag', tag], { cwd: tmpDir, stdio: 'inherit' });

	console.log(`Published ${packageName} to npm\n`);
}
