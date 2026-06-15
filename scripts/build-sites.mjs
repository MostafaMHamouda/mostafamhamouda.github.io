import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const siteBuildDir = path.join(rootDir, '.site-build');
const artifactDistDir = path.join(siteBuildDir, 'dist');
const clientDir = path.join(artifactDistDir, 'client');
const serverDir = path.join(artifactDistDir, 'server');
const openaiDir = path.join(artifactDistDir, '.openai');

rmSync(siteBuildDir, { force: true, recursive: true });
mkdirSync(serverDir, { recursive: true });
mkdirSync(openaiDir, { recursive: true });

execSync('npm run build:web', {
  cwd: rootDir,
  stdio: 'inherit',
});

const workerEntrypoint = `export default {
  async fetch(request, env) {
    if (!env?.ASSETS || typeof env.ASSETS.fetch !== 'function') {
      return new Response('Static assets binding is missing.', { status: 500 });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;
    const isAssetRequest =
      pathname.startsWith('/assets/') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/robots') ||
      pathname.startsWith('/sitemap') ||
      /\\.[a-zA-Z0-9]+$/.test(pathname);

    if (isAssetRequest) {
      return env.ASSETS.fetch(request);
    }

    const fallbackUrl = new URL('/index.html', url);
    return env.ASSETS.fetch(new Request(fallbackUrl, request));
  },
};
`;

writeFileSync(path.join(serverDir, 'index.js'), workerEntrypoint, 'utf8');
cpSync(path.join(rootDir, '.openai', 'hosting.json'), path.join(openaiDir, 'hosting.json'));

if (!existsSync(clientDir)) {
  throw new Error('Client build output was not created.');
}

console.log(`Sites artifact prepared at ${artifactDistDir}`);
