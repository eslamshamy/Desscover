// Builds DESSCOVER online from src/ into one self-contained page.
//   node build.mjs            -> index.html (the website) and dist/desscover.html (the same page, for claude.ai)
// Edit a landmark in src/landmarks/<id>.js, shared code in src/core/, then run the build again.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const read = p => readFile(new URL(p, import.meta.url), 'utf8');
const coreOrder = JSON.parse(await read('src/core/order.json'));
const landmarkOrder = JSON.parse(await read('src/landmarks/order.json'));

let app = '';
for (const f of coreOrder) app += await read('src/core/' + f);

let landmarks = 'const REG = {};\nconst LANDMARK_ORDER = ' + JSON.stringify(landmarkOrder) + ';\n';
for (const id of landmarkOrder) landmarks += '\n' + await read('src/landmarks/' + id + '.js');

const mapdata = (await read('src/data/mapdata.js')).replace(/^\/\/[^\n]*\n/, '');
const de = JSON.stringify(JSON.parse(await read('src/i18n/de.json')));
if (!app.includes('/*@LANDMARKS*/') || !app.includes('/*@MAPDATA*/')) throw new Error('A marker is missing in src/core');
app = app.replace('/*@MAPDATA*/\n', () => mapdata).replace('/*@LANDMARKS*/\n', () => landmarks);
if (!app.includes('/*@I18N_DE*/{}')) throw new Error('The German dictionary marker is missing');
app = app.replace('/*@I18N_DE*/{}', () => de);
if (app.includes('</script')) throw new Error('The code must not contain a closing script tag');

const shell = await read('src/shell.html');
if (!shell.includes('/*__APP__*/')) throw new Error('src/shell.html has no /*__APP__*/ placeholder');
const page = shell.replace('/*__APP__*/', () => app);

await mkdir(new URL('dist/', import.meta.url), { recursive: true });
await writeFile(new URL('index.html', import.meta.url), page);
await writeFile(new URL('dist/desscover.html', import.meta.url), page);
console.log('Built index.html (' + Math.round(page.length / 1024) + ' kB) from', coreOrder.length, 'core files and', landmarkOrder.length, 'landmarks.');
