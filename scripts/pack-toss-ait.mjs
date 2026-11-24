import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AITWriter } from '@apps-in-toss/ait-format';
import { PlatformType } from '@apps-in-toss/ait-format-proto';
import { uuidv7 } from 'uuidv7';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const candidateDirs = [
  path.resolve(projectRoot, 'dist'),
  path.resolve(projectRoot, '.output/public'),
  path.resolve(projectRoot, 'dist/client'),
  path.resolve(projectRoot, 'public'),
];

let outDir = candidateDirs.find((d) => fs.existsSync(d) && fs.readdirSync(d).length > 0);
if (!outDir) {
  outDir = path.resolve(projectRoot, 'dist');
}

console.log(`📦 Packaging when-end.ait for Apps in Toss using source dir: ${outDir}`);

const deploymentId = uuidv7();
const appName = 'when-end';
console.log(`🔑 Generated deploymentId: ${deploymentId}`);

const pkgJsonPath = path.resolve(projectRoot, 'package.json');
const projectPackageJson = fs.existsSync(pkgJsonPath)
  ? JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
  : {};

const appsInTossConfig = {
  appName,
  brand: {
    displayName: '언제끝나',
    primaryColor: '#3182F6',
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: false,
    withTitle: true,
    transparentBackground: false,
  },
  permissions: [],
  webBundleDir: path.relative(projectRoot, outDir) || 'dist',
};

const writer = new AITWriter({
  appName,
  deploymentId,
  createdBy: '@apps-in-toss/cli',
});

writer.setMetadata({
  platform: PlatformType.WEB,
  sdkVersion: '3.10.0',
  packageJson: projectPackageJson,
  extra: {
    unityMetadata: null,
    appsInTossConfig,
  },
});

function getAllFiles(dir, baseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...getAllFiles(full, baseDir));
    } else {
      const rel = path.relative(baseDir, full).replace(/\\/g, '/');
      const data = new Uint8Array(fs.readFileSync(full));
      result.push({ name: rel, data });
    }
  }
  return result;
}

const webBundleFiles = getAllFiles(outDir, outDir);
console.log(`📂 Found ${webBundleFiles.length} files to bundle.`);

for (const file of webBundleFiles) {
  writer.addFile(`sources/${file.name}`, file.data);
}

const appJson = {
  appName,
  deploymentId,
  version: '1.0.0',
  entry: 'index.html',
};
writer.addFile('sources/app.json', new Uint8Array(Buffer.from(JSON.stringify(appJson, null, 2), 'utf-8')));

const bundleJson = {
  deploymentId,
  byteLength: webBundleFiles.reduce((acc, cur) => acc + cur.data.byteLength, 0),
  sdk: {
    name: '@apps-in-toss/web-framework',
    version: '3.10.0',
  },
  config: appsInTossConfig,
};
writer.addFile('bundle.json', new Uint8Array(Buffer.from(JSON.stringify(bundleJson, null, 2), 'utf-8')));

if (fs.existsSync(pkgJsonPath)) {
  writer.addFile('project-package.json', new Uint8Array(fs.readFileSync(pkgJsonPath)));
}

const artifactBuffer = await writer.toBuffer();
const outPath = path.resolve(projectRoot, `${appName}.ait`);
fs.writeFileSync(outPath, Buffer.from(artifactBuffer));

console.log(`✨ Successfully created ${appName}.ait (${artifactBuffer.byteLength} bytes)`);
console.log(`🚀 File location: ${outPath}`);
