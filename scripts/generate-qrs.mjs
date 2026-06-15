import fs from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';

const baseUrl = (process.argv[2] ?? '').trim().replace(/\/$/, '');

if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
  console.error('Usage: npm run qr:generate -- https://your-public-url');
  process.exit(1);
}

const outputDir = path.resolve('qr-codes');

const routes = [
  ['01-start.png', 'Start', '/start'],
  ['02-education.png', 'Education World', '/education/mirror-of-misunderstanding?qr=fahim-blue'],
  ['03-entrepreneurship.png', 'Entrepreneurship World', '/entrepreneurship/market-of-needs?qr=riyada-red'],
  ['04-entertainment.png', 'Entertainment World', '/entertainment/story-loom?qr=sharara-gold'],
  ['05-exploration.png', 'Exploration World', '/exploration/listening-compass?qr=rahhal-green'],
  ['06-fog-perfect-answer.png', 'Fog Trap Perfect Answer', '/fog/perfect-answer?qr=fog-perfect'],
  ['07-fog-shiny-idea.png', 'Fog Trap Shiny Idea', '/fog/shiny-idea?qr=fog-shiny'],
  ['08-fog-empty-performance.png', 'Fog Trap Empty Performance', '/fog/empty-performance?qr=fog-stage'],
  ['09-fog-rush-path.png', 'Fog Trap Rush Path', '/fog/rush-path?qr=fog-pattern'],
  ['10-fog-lone-hero.png', 'Fog Trap Lone Hero', '/fog/lone-hero?qr=fog-balance'],
  ['11-bonus-badge-constellation.png', 'Bonus Badge Constellation', '/bonus/badge-constellation?qr=bonus-stars'],
  ['12-bonus-wonder-log.png', 'Bonus Wonder Log', '/bonus/wonder-log?qr=bonus-light'],
  ['13-bonus-prototype-flame.png', 'Bonus Prototype Flame', '/bonus/prototype-flame?qr=bonus-flame'],
  ['14-bonus-anti-dimness-oath.png', 'Bonus Anti-Dimness Oath', '/bonus/anti-dimness-oath?qr=bonus-bond'],
  ['15-final-gate.png', 'Final Gate', '/final-gate?qr=final-spark'],
];

await fs.mkdir(outputDir, { recursive: true });

const readmeLines = ['# Learnova QR Codes', ''];

for (const [filename, label, route] of routes) {
  const fullUrl = `${baseUrl}${route}`;
  await QRCode.toFile(path.join(outputDir, filename), fullUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    scale: 10,
    color: {
      dark: '#0b1228',
      light: '#0000',
    },
  });

  readmeLines.push(`- ${label}: ${fullUrl}`);
}

readmeLines.push('', `Generated from base URL: ${baseUrl}`);

await fs.writeFile(path.join(outputDir, 'README.md'), `${readmeLines.join('\n')}\n`, 'utf8');

console.log(`QR codes generated in ${outputDir}`);
