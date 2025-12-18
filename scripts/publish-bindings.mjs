import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const execAsync = promisify(exec);
const __dirname = fileURLToPath(dirname(import.meta.url));
const packageJson = JSON.parse(await readFile(resolve(__dirname, '..', 'package.json'), 'utf8'));
const tag = process.env.TAG;
const artifactsDir = resolve(__dirname, '..', 'artifacts');
const name = 'monotonic-time';
const bindingFilename = `${name}.node`;
const bindings = {};

// find all bindings in the artifacts directory
for (const target of await readdir(artifactsDir)) {
	try {
		const binding = join(artifactsDir, target, bindingFilename);
		if ((await stat(binding)).isFile()) {
			bindings[target] = binding;
		}
	} catch {
		// ignore
	}
}

// cross check the bindings against the optionalDependencies
for (const dep of Object.keys(packageJson.optionalDependencies)) {
	const target = dep.replace(`${packageJson.name}-`, '');
	if (!bindings[target]) {
		throw new Error(`Binding for ${dep} not found in artifacts`);
	}
}

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

	console.log(`Publishing ${packageName}`);
	console.log(pkgJson);

	const tmpDir = join(tmpdir(), `${name}-${target}-${packageJson.version}`);
	await mkdir(tmpDir, { recursive: true });

	await copyFile(bindings[target], join(tmpDir, bindingFilename));
	await writeFile(join(tmpDir, 'README.md'), `# ${name}-${target}\n\n` +
		`${target} binding for [${name}](https://npmjs.com/package/${packageName}).`);
	await writeFile(join(tmpDir, 'package.json'), pkgJson);

	await execAsync(`pnpm publish --access public --dry-run --tag ${tag}`, { cwd: tmpDir, stdio: 'inherit' });

	console.log(`Published ${packageName} to npm`);
}
